import { t } from './trpc_init';
import { complaints_router } from './routers/complaints';
import { address_router } from './routers/address';
import { super_admin_router } from './routers/super_admin';
import { worker_router } from './routers/worker';

export const appRouter = t.router({
  complaints: complaints_router,
  address: address_router,
  super_admin: super_admin_router,
  worker: worker_router
});

export type AppRouter = typeof appRouter;
