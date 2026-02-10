import { protectedWorkerProcedure, protectedProcedure, t } from '../trpc_init';
import { db } from '~/db/db';
import { actions, notifications } from '~/db/schema';
import { z } from 'zod';
import { eq, desc, and, sql } from 'drizzle-orm';

/** List all actions assigned to the current worker */
const list_actions_route = protectedWorkerProcedure.query(async ({ ctx }) => {
  const data = await db.query.actions.findMany({
    where: eq(actions.assigned_worker_id, ctx.user.id),
    orderBy: [desc(actions.created_at)],
    with: {
      complaint: {
        columns: {
          id: true,
          title: true,
          description: true,
          category: true,
          latitude: true,
          longitude: true,
          status: true,
          image_s3_key: true,
          created_at: true
        },
        with: {
          user: {
            columns: {
              name: true,
              displayUsername: true
            }
          }
        }
      }
    }
  });
  return data;
});

/** List notifications for the current user */
const list_notifications_route = protectedProcedure.query(async ({ ctx }) => {
  const data = await db.query.notifications.findMany({
    where: eq(notifications.user_id, ctx.user.id),
    orderBy: [desc(notifications.created_at)],
    limit: 50
  });
  return data;
});

/** Mark a notification as read */
const mark_notification_read_route = protectedProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ ctx, input }) => {
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, input.id), eq(notifications.user_id, ctx.user.id)));
    return { success: true };
  });

/** Mark all notifications as read */
const mark_all_read_route = protectedProcedure.mutation(async ({ ctx }) => {
  await db.update(notifications).set({ read: true }).where(eq(notifications.user_id, ctx.user.id));
  return { success: true };
});

/** Get unread notification count */
const unread_count_route = protectedProcedure.query(async ({ ctx }) => {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.user_id, ctx.user.id), eq(notifications.read, false)));
  return { count: result[0]?.count ?? 0 };
});

export const worker_router = t.router({
  list_actions: list_actions_route,
  list_notifications: list_notifications_route,
  mark_notification_read: mark_notification_read_route,
  mark_all_read: mark_all_read_route,
  unread_count: unread_count_route
});
