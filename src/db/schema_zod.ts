import { z } from 'zod';
import {
  user,
  account,
  verification,
  complaints,
  actions,
  notifications,
  CATEGORY_ENUM_SCHEMA,
  STATUS_ENUM_SCHEMA,
  ACTION_STATUS_ENUM_SCHEMA
} from './schema';
import { createSelectSchema } from 'drizzle-zod';

export { CATEGORY_ENUM_SCHEMA, STATUS_ENUM_SCHEMA, ACTION_STATUS_ENUM_SCHEMA };

export const UserSchemaZod = createSelectSchema(user, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  banExpires: z.coerce.date()
});
export const AccountSchemaZod = createSelectSchema(account, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  accessTokenExpiresAt: z.coerce.date().nullable(),
  refreshTokenExpiresAt: z.coerce.date().nullable()
});
export const VerificationSchemaZod = createSelectSchema(verification, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  expiresAt: z.coerce.date()
});
export const ComplaintSchemaZod = createSelectSchema(complaints, {
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  resolved_at: z.coerce.date().nullable(),
  category: CATEGORY_ENUM_SCHEMA,
  status: STATUS_ENUM_SCHEMA
});

export const ActionSchemaZod = createSelectSchema(actions, {
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  status: ACTION_STATUS_ENUM_SCHEMA
});
export const NotificationSchemaZod = createSelectSchema(notifications, {
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});
