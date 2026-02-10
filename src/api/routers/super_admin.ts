import { protectedSuperAdminProcedure, protectedAdminProcedure, t } from '../trpc_init';
import { db } from '~/db/db';
import { user } from '~/db/schema';
import { z } from 'zod';
import { eq, ilike, or, and, ne } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

const ROLE_ENUM = z.enum(['user', 'admin', 'worker', 'super_admin']);

/** Search users by name or username — admin-accessible for worker assignment */
const search_users_route = protectedAdminProcedure
  .input(
    z.object({
      query: z.string().min(1).max(100),
      roleFilter: z.enum(['all', 'user', 'admin', 'worker', 'super_admin']).optional()
    })
  )
  .query(async ({ input }) => {
    const { query, roleFilter } = input;
    const pattern = `%${query}%`;
    const nameCondition = or(ilike(user.name, pattern), ilike(user.email, pattern));
    const where =
      roleFilter && roleFilter !== 'all'
        ? and(nameCondition, eq(user.role, roleFilter))
        : nameCondition;

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
      .where(where ?? undefined)
      .limit(20);

    return users;
  });

/** Change a user's role — super admin only */
const change_user_role_route = protectedSuperAdminProcedure
  .input(
    z.object({
      userId: z.string(),
      role: ROLE_ENUM
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

    return { success: true };
  });

export const super_admin_router = t.router({
  search_users: search_users_route,
  change_user_role: change_user_role_route
});
