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
  user_id: text().references(() => user.id, { onDelete: 'cascade' }),
  title: text().notNull(),
  description: text(),
  status: text().notNull().default('open').$type<z.infer<typeof STATUS_ENUM_SCHEMA>>(),
  category: varchar({ length: 30 }).notNull().$type<z.infer<typeof CATEGORY_ENUM_SCHEMA>>(),
  longitude: real().notNull(),
  latitude: real().notNull(),
  image_s3_key: text(),
  resolved_at: timestamp(),
  resolved_by: text().references(() => user.id, { onDelete: 'set null' }),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp()
    .notNull()
    .$onUpdate(() => new Date())
});

export const user_data = pgTable('user_data', {
  id: text()
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  reward_points: integer().notNull().default(0),
  address: text()
});

export const notifications = pgTable('notifications', {
  id: serial().primaryKey(),
  /** sent to the user id */
  user_id: text()
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  sent_by_id: text()
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  /** Optional complaint id to which it is connected */
  complaint_id: uuid().references(() => complaints.id, { onDelete: 'set null' }),
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
    .references(() => complaints.id, { onDelete: 'cascade' })
    .notNull(),
  assigned_worker_id: text()
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  status: text()
    .notNull()
    .default('in_progress')
    .$type<z.infer<typeof ACTION_STATUS_ENUM_SCHEMA>>(),
  s3_image_key: text(),
  /** Admin notes / retry instructions */
  admin_notes: text(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp()
    .notNull()
    .$onUpdate(() => new Date())
});

// relations

export const userRelations = relations(user, ({ many }) => ({
  complaints: many(complaints),
  notifications: many(notifications)
}));

export const complaintRelations = relations(complaints, ({ one, many }) => ({
  user: one(user, {
    fields: [complaints.user_id],
    references: [user.id]
  }),
  actions: many(actions),
  notifications: many(notifications)
}));

export const actionRelations = relations(actions, ({ one, many }) => ({
  complaint: one(complaints, {
    fields: [actions.complaint_id],
    references: [complaints.id]
  }),
  worker: one(user, {
    fields: [actions.assigned_worker_id],
    references: [user.id]
  }),
  notifications: many(notifications)
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.user_id],
    references: [user.id]
  }),
  complaint: one(complaints, {
    fields: [notifications.complaint_id],
    references: [complaints.id]
  })
}));
