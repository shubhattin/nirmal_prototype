import { pgTable, text, timestamp, uuid, real, varchar, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth_schema';
import z from 'zod';

export { user, account, verification } from './auth_schema';

export const CATEGORY_ENUM_SCHEMA = z.enum(['biodegradable', 'non-biodegradable', 'other']);
export const STATUS_ENUM_SCHEMA = z.enum([
  'open',
  'in_progress',
  'resolved',
  'closed',
  'under_review'
]);

export const complaints = pgTable('complaints', {
  id: uuid().primaryKey().defaultRandom(),
  user_id: text().references(() => user.id),
  title: text().notNull(),
  description: text(),
  status: text().notNull().default('open').$type<z.infer<typeof STATUS_ENUM_SCHEMA>>(),
  category: varchar({ length: 30 }).notNull().$type<z.infer<typeof CATEGORY_ENUM_SCHEMA>>(),
  longitude: real().notNull(),
  latitude: real().notNull(),
  image_s3_key: text(),
  resolved_at: timestamp(),
  resolved_by: text().references(() => user.id),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp()
    .notNull()
    .$onUpdate(() => new Date())
});

export const user_data = pgTable('user_data', {
  id: text()
    .primaryKey()
    .references(() => user.id),
  reward_points: integer().notNull().default(0),
  address: text()
});

// relations

export const userRelations = relations(user, ({ many }) => ({
  complaints: many(complaints)
}));

export const complaintRelations = relations(complaints, ({ one }) => ({
  user: one(user, {
    fields: [complaints.user_id],
    references: [user.id]
  })
}));
