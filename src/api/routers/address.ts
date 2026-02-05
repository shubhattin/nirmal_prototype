import { eq } from 'drizzle-orm';
import { protectedProcedure, t } from '../trpc_init';
import { db } from '~/db/db';
import { user_data } from '~/db/schema';
import { z } from 'zod';

const get_user_address_route = protectedProcedure.query(async ({ ctx }) => {
  const user_info = await db.query.user_data.findFirst({
    where: eq(user_data.id, ctx.user.id),
    columns: {
      address: true
    }
  });
  return { address: user_info?.address || null };
});

const update_user_address_route = protectedProcedure
  .input(
    z.object({
      address: z.string()
    })
  )
  .mutation(async ({ ctx, input }) => {
    const exists_data = await db.query.user_data.findFirst({
      where: eq(user_data.id, ctx.user.id),
      columns: {
        id: true
      }
    });
    if (!exists_data) {
      await db.insert(user_data).values({ id: ctx.user.id, address: input.address });
    } else {
      await db
        .update(user_data)
        .set({ address: input.address })
        .where(eq(user_data.id, ctx.user.id));
    }
  });

const pickup_missed_waste_route = protectedProcedure.mutation(async ({ ctx }) => {
  const user_info = await db.query.user_data.findFirst({
    where: eq(user_data.id, ctx.user.id),
    columns: {
      address: true
    }
  });
  const address = user_info?.address;
  if (!address) return { error: 'Address not found' };
  return { success: true };
});

export const address_router = t.router({
  get_user_address: get_user_address_route,
  update_user_address: update_user_address_route,
  pickup_missed_waste: pickup_missed_waste_route
});
