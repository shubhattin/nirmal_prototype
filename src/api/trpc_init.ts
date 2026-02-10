import type { Context } from './context';
import { TRPCError, initTRPC } from '@trpc/server';
import transformer from './transformer';

export const t = initTRPC.context<Context>().create({
  transformer
});

export const publicProcedure = t.procedure;

export const protectedUnverifiedProcedure = publicProcedure.use(async function isAuthed({
  next,
  ctx: { user }
}) {
  if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({
    ctx: { user }
  });
});

/** Logged in users */
export const protectedProcedure = publicProcedure.use(async function isAuthed({
  next,
  ctx: { user }
}) {
  if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({
    ctx: { user }
  });
});

/** role `worker` user */
export const protectedWorkerProcedure = protectedProcedure.use(async function isAuthed({
  next,
  ctx: { user }
}) {
  if (user.role !== 'worker')
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not a Worker User' });
  return next({
    ctx: { user }
  });
});

/** Allow both admin and super admin users */
export const protectedAdminProcedure = protectedProcedure.use(async function isAuthed({
  next,
  ctx: { user }
}) {
  if (user.role !== 'admin' && user.role !== 'super_admin')
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not a Admin User' });
  return next({
    ctx: { user }
  });
});

/** Only super admin users */
export const protectedSuperAdminProcedure = protectedProcedure.use(async function isAuthed({
  next,
  ctx: { user }
}) {
  if (user.role !== 'super_admin')
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not Super a Admin User' });
  return next({
    ctx: { user }
  });
});

export const verify_cloudflare_turnstile_token = async (token: string) => {
  try {
    const response = await fetch(`https://challenges.cloudflare.com/turnstile/v0/siteverify`, {
      method: 'POST',
      body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: token }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error(error);
    return false;
  }
};
