import { t } from './trpc_init';
import { complaints_router } from './routers/complaints';
import { address_router } from './routers/address';

export const appRouter = t.router({
  complaints: complaints_router,
  address: address_router
});

export type AppRouter = typeof appRouter;
