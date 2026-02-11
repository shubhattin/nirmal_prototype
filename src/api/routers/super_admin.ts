import { protectedSuperAdminProcedure, protectedAdminProcedure, t } from '../trpc_init';
import { db } from '~/db/db';
import { user } from '~/db/schema';
import { z } from 'zod';
import { eq, ilike, or, and, ne } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { redis } from '~/db/redis';

const ROLE_ENUM = z.enum(['user', 'admin', 'worker', 'super_admin']);

/** Search users by name or username — admin-accessible for worker assignment */
const search_users_route = protectedAdminProcedure
  .input(
    z.object({
      query: z.string().min(0).max(100),
      roleFilter: z.enum(['all', 'user', 'admin', 'worker', 'super_admin']).optional()
    })
  )
  .query(async ({ ctx, input }) => {
    const { query, roleFilter } = input;
    const pattern = `%${query}%`;

    const searchCondition = or(ilike(user.name, pattern), ilike(user.email, pattern));

    // Filter out the requesting user and all super admins
    const exclusions = and(ne(user.id, ctx.user.id), ne(user.role, 'super_admin'));

    const where =
      roleFilter && roleFilter !== 'all'
        ? and(searchCondition, exclusions, eq(user.role, roleFilter))
        : and(searchCondition, exclusions);

    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        displayUsername: user.displayUsername
      })
      .from(user)
      .where(where)
      .limit(10);

    return users;
  });

/** Change a user's role — super admin only */
const change_user_role_route = protectedSuperAdminProcedure
  .input(
    z.object({
      userId: z.string(),
      role: ROLE_ENUM.exclude(['super_admin'])
    })
  )
  .mutation(async ({ ctx, input }) => {
    if (ctx.user.id === input.userId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Cannot change your own role'
      });
    }

    const targetUser = await db.query.user.findFirst({
      where: eq(user.id, input.userId),
      columns: { id: true }
    });

    if (!targetUser) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    await db.update(user).set({ role: input.role }).where(eq(user.id, input.userId));

    // Invalidate Redis cache
    const sessionKey = `active-sessions-${input.userId}`;
    const sessionValue = (await redis.get(sessionKey)) as
      | { token: string; expiresAt: number }[]
      | null;

    if (sessionValue) {
      const keysToDelete = [sessionKey];
      if (Array.isArray(sessionValue)) {
        keysToDelete.push(...sessionValue.map((s) => s.token));
      }

      await redis.del(...keysToDelete);
    }

    return { success: true };
  });

export const super_admin_router = t.router({
  search_users: search_users_route,
  change_user_role: change_user_role_route
});
