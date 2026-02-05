import { z } from 'zod';
import {
  user,
  account,
  verification,
  complaints,
  CATEGORY_ENUM_SCHEMA,
  STATUS_ENUM_SCHEMA
} from './schema';
import { createSelectSchema } from 'drizzle-zod';

export { CATEGORY_ENUM_SCHEMA, STATUS_ENUM_SCHEMA };

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
  category: CATEGORY_ENUM_SCHEMA,
  status: STATUS_ENUM_SCHEMA
});
