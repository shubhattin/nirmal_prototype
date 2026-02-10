import { STATUS_ENUM_SCHEMA } from '~/db/schema_zod';
import { t, protectedProcedure, protectedAdminProcedure } from '../trpc_init';
import { complaints, user_data, actions, notifications, user } from '~/db/schema';
import { db } from '~/db/db';
import { z } from 'zod';
import { eq, sql, and } from 'drizzle-orm';
import { deleteAssetFile } from '~/tools/s3/upload_file.server';
import { TRPCError } from '@trpc/server';

const list_complaints_route = protectedProcedure.query(async ({ ctx }) => {
  const isAdmin = ctx.user.role === 'admin' || ctx.user.role === 'super_admin';
  const data = await db.query.complaints.findMany({
    orderBy: (tbl, { desc }) => [desc(tbl.created_at)],
    where: isAdmin ? undefined : eq(complaints.user_id, ctx.user.id),
    with: {
      user: {
        columns: {
          name: true,
          id: true,
          displayUsername: true
        }
      },
      actions: isAdmin
        ? {
            orderBy: (tbl, { desc }) => [desc(tbl.created_at)],
            with: {
              worker: {
                columns: {
                  id: true,
                  name: true,
                  displayUsername: true,
                  image: true
                }
              }
            }
          }
        : undefined
    }
  });
  return data;
});

const RESOLVED_REWARD_POINTS = 10;

/** Helper to create a notification */
async function createNotification(params: {
  userId: string;
  sentById: string;
  title: string;
  description?: string;
  complaintId?: string;
  actionId?: number;
}) {
  await db.insert(notifications).values({
    user_id: params.userId,
    sent_by_id: params.sentById,
    title: params.title,
    description: params.description,
    complaint_id: params.complaintId,
    action_id: params.actionId
  });
}

const update_status_route = protectedAdminProcedure
  .input(
    z.object({
      id: z.string(),
      status: STATUS_ENUM_SCHEMA
    })
  )
  .mutation(async ({ ctx: { user: adminUser }, input }) => {
    const { id, status } = input;
    await db.transaction(async (tx) => {
      const complaint = await tx.query.complaints.findFirst({
        where: (tbl, { eq }) => eq(tbl.id, id),
        columns: {
          user_id: true,
          title: true
        }
      });
      if (!complaint?.user_id) return;

      const prev_user_record_exists = await tx.query.user_data.findFirst({
        where: (tbl, { eq }) => eq(tbl.id, complaint.user_id!)
      });

      await Promise.all([
        tx
          .update(complaints)
          .set({
            status,
            ...(status === 'resolved' ? { resolved_at: new Date(), resolved_by: adminUser.id } : {})
          })
          .where(eq(complaints.id, id)),
        status === 'resolved'
          ? prev_user_record_exists
            ? tx
                .update(user_data)
                .set({
                  reward_points: sql`${user_data.reward_points} + ${RESOLVED_REWARD_POINTS}`
                })
                .where(eq(user_data.id, complaint.user_id!))
            : tx
                .insert(user_data)
                .values({ id: complaint.user_id!, reward_points: RESOLVED_REWARD_POINTS })
          : Promise.resolve()
      ]);

      // Notify user on resolved or closed
      if (status === 'resolved' || status === 'closed') {
        const statusLabel = status === 'resolved' ? 'Resolved' : 'Closed';
        await tx.insert(notifications).values({
          user_id: complaint.user_id!,
          sent_by_id: adminUser.id,
          complaint_id: id,
          title: `Complaint ${statusLabel}`,
          description: `Your complaint "${complaint.title}" has been marked as ${statusLabel.toLowerCase()}.`
        });
      }
    });
  });

const delete_complaint_route = protectedAdminProcedure
  .input(
    z.object({
      id: z.string()
    })
  )
  .mutation(async ({ input }) => {
    const { id } = input;
    const complaint = await db.query.complaints.findFirst({
      where: (tbl, { eq }) => eq(tbl.id, id)
    });
    if (!complaint) return;
    if (complaint.image_s3_key) {
      await deleteAssetFile(complaint.image_s3_key);
    }
    await db.delete(complaints).where(eq(complaints.id, id));
  });

const user_reward_points_route = protectedProcedure.query(async ({ ctx: { user } }) => {
  const info = await db.query.user_data.findFirst({
    where: (tbl, { eq }) => eq(tbl.id, user.id)
  });

  return {
    reward_points: info?.reward_points ?? 0
  };
});

/** Admin assigns a worker to a complaint */
const assign_worker_route = protectedAdminProcedure
  .input(
    z.object({
      complaintId: z.string(),
      workerId: z.string()
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { complaintId, workerId } = input;

    // Verify complaint exists
    const complaint = await db.query.complaints.findFirst({
      where: eq(complaints.id, complaintId),
      columns: { id: true, title: true, status: true }
    });
    if (!complaint) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Complaint not found' });
    }

    // Verify worker exists and has worker role
    const workerUser = await db.query.user.findFirst({
      where: eq(user.id, workerId),
      columns: { id: true, role: true, name: true }
    });
    if (!workerUser || workerUser.role !== 'worker') {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid worker user' });
    }

    // Create the action
    const [newAction] = await db
      .insert(actions)
      .values({
        complaint_id: complaintId,
        assigned_worker_id: workerId,
        status: 'in_progress'
      })
      .returning();

    // Update complaint status to in_progress
    await db
      .update(complaints)
      .set({ status: 'in_progress' })
      .where(eq(complaints.id, complaintId));

    // Send notification to the worker
    await createNotification({
      userId: workerId,
      sentById: ctx.user.id,
      title: 'New Task Assigned',
      description: `You have been assigned to complaint: "${complaint.title}". Please take action and submit evidence.`,
      complaintId,
      actionId: newAction.id
    });

    return { actionId: newAction.id };
  });

/** Admin reviews a worker's action submission */
const review_action_route = protectedAdminProcedure
  .input(
    z.object({
      actionId: z.number(),
      approved: z.boolean(),
      notes: z.string().optional()
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { actionId, approved, notes } = input;

    const action = await db.query.actions.findFirst({
      where: eq(actions.id, actionId),
      with: {
        complaint: {
          columns: { id: true, title: true, user_id: true }
        }
      }
    });

    if (!action) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Action not found' });
    }

    if (action.status !== 'under_review') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Action is not under review'
      });
    }

    await db.transaction(async (tx) => {
      if (approved) {
        // Approve: action → resolved, complaint → resolved
        await tx.update(actions).set({ status: 'resolved' }).where(eq(actions.id, actionId));

        await tx
          .update(complaints)
          .set({
            status: 'resolved',
            resolved_at: new Date(),
            resolved_by: ctx.user.id
          })
          .where(eq(complaints.id, action.complaint_id));

        // Award reward points to complaint user
        if (action.complaint.user_id) {
          const existingUserData = await tx.query.user_data.findFirst({
            where: eq(user_data.id, action.complaint.user_id)
          });
          if (existingUserData) {
            await tx
              .update(user_data)
              .set({
                reward_points: sql`${user_data.reward_points} + ${RESOLVED_REWARD_POINTS}`
              })
              .where(eq(user_data.id, action.complaint.user_id));
          } else {
            await tx
              .insert(user_data)
              .values({ id: action.complaint.user_id, reward_points: RESOLVED_REWARD_POINTS });
          }

          // Notify the complaint user
          await tx.insert(notifications).values({
            user_id: action.complaint.user_id,
            sent_by_id: ctx.user.id,
            complaint_id: action.complaint_id,
            action_id: actionId,
            title: 'Complaint Resolved',
            description: `Your complaint "${action.complaint.title}" has been resolved.`
          });
        }

        // Notify the worker
        await tx.insert(notifications).values({
          user_id: action.assigned_worker_id,
          sent_by_id: ctx.user.id,
          complaint_id: action.complaint_id,
          action_id: actionId,
          title: 'Action Approved',
          description: `Your work on "${action.complaint.title}" has been approved. Great job!`
        });
      } else {
        // Reject: action → closed
        await tx
          .update(actions)
          .set({ status: 'closed', admin_notes: notes ?? null })
          .where(eq(actions.id, actionId));

        // Create a new retry action for the same worker with notes
        const [retryAction] = await tx
          .insert(actions)
          .values({
            complaint_id: action.complaint_id,
            assigned_worker_id: action.assigned_worker_id,
            status: 'in_progress',
            admin_notes: notes ?? null
          })
          .returning();

        // Notify the worker about the rejection and retry
        await tx.insert(notifications).values({
          user_id: action.assigned_worker_id,
          sent_by_id: ctx.user.id,
          complaint_id: action.complaint_id,
          action_id: retryAction.id,
          title: 'Action Rejected — Retry Required',
          description: notes
            ? `Your submission for "${action.complaint.title}" was rejected. Admin notes: ${notes}`
            : `Your submission for "${action.complaint.title}" was rejected. Please try again.`
        });
      }
    });

    return { success: true };
  });

export const complaints_router = t.router({
  list_complaints: list_complaints_route,
  update_status: update_status_route,
  delete_complaint: delete_complaint_route,
  user_reward_points: user_reward_points_route,
  assign_worker: assign_worker_route,
  review_action: review_action_route
});
