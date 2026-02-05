import { STATUS_ENUM_SCHEMA } from '~/db/schema_zod';
import { t, protectedProcedure, protectedAdminProcedure } from '../trpc_init';
import { complaints, user_data } from '~/db/schema';
import { db } from '~/db/db';
import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { deleteAssetFile } from '~/tools/s3/upload_file.server';

const list_complaints_route = protectedProcedure.query(async ({ ctx }) => {
  const isAdmin = ctx.user.role === 'admin';
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
      }
    }
  });
  return data;
});

const RESOLVED_REWARD_POINTS = 10;
const update_status_route = protectedAdminProcedure
  .input(
    z.object({
      id: z.string(),
      status: STATUS_ENUM_SCHEMA
    })
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { id, status } = input;
    await db.transaction(async (tx) => {
      const complaint_user_id = (
        await tx.query.complaints.findFirst({
          where: (tbl, { eq }) => eq(tbl.id, id),
          columns: {
            user_id: true
          }
        })
      )?.user_id;
      if (!complaint_user_id) return;
      const prev_user_record_exists = await tx.query.user_data.findFirst({
        where: (tbl, { eq }) => eq(tbl.id, complaint_user_id)
      });
      await Promise.all([
        tx
          .update(complaints)
          .set({
            status,
            ...(status === 'resolved' ? { resolved_at: new Date(), resolved_by: user.id } : {})
          })
          .where(eq(complaints.id, id)),
        status === 'resolved'
          ? prev_user_record_exists
            ? tx
                .update(user_data)
                .set({ reward_points: sql`${user_data.reward_points} + ${RESOLVED_REWARD_POINTS}` })
                .where(eq(user_data.id, complaint_user_id))
            : tx
                .insert(user_data)
                .values({ id: complaint_user_id, reward_points: RESOLVED_REWARD_POINTS })
          : Promise.resolve()
      ]);
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

export const complaints_router = t.router({
  list_complaints: list_complaints_route,
  update_status: update_status_route,
  delete_complaint: delete_complaint_route,
  user_reward_points: user_reward_points_route
});
