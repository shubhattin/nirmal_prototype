import {
  pgTable,
  text,
  timestamp,
  uuid,
  real,
  varchar,
  integer,
  serial,
  boolean
} from 'drizzle-orm/pg-core';
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
export const ACTION_STATUS_ENUM_SCHEMA = z.enum([
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

export const notifications = pgTable('notifications', {
  id: serial().primaryKey(),
  /** sent to the user id, */
  user_id: text()
    .references(() => user.id)
    .notNull(),
  sent_by_id: text()
    .references(() => user.id)
    .notNull(),
  /** Optional complaint id to which it is connected */
  complaint_id: uuid().references(() => complaints.id),
  read: boolean().notNull().default(false),
  title: text().notNull(),
  description: text(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp()
    .notNull()
    .$onUpdate(() => new Date())
});

export const actions = pgTable('actions', {
  id: serial().primaryKey(),
  complaint_id: uuid()
    .references(() => complaints.id)
    .notNull(),
  assigned_worker_id: text()
    .references(() => user.id)
    .notNull(),
  status: text()
    .notNull()
    .default('in_progress')
    .$type<z.infer<typeof ACTION_STATUS_ENUM_SCHEMA>>(),
  s3_image_key: text(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp()
    .notNull()
    .$onUpdate(() => new Date())
});

// relations

export const userRelations = relations(user, ({ many }) => ({
  complaints: many(complaints)
}));

export const complaintRelations = relations(complaints, ({ one, many }) => ({
  user: one(user, {
    fields: [complaints.user_id],
    references: [user.id]
  }),
  actions: many(actions)
}));

export const actionRelation = relations(actions, ({ one }) => ({
  complaint: one(complaints, {
    fields: [actions.complaint_id],
    references: [complaints.id]
  })
}));
