import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uuid,
  date,
  primaryKey,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").unique(),
  fullName: text("full_name"),
  employeeID: text("employee_id"),
  role: text("role").default("user"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;

export const usersRelations = relations(users, ({ many }) => ({
  punchRecords: many(punchRecords),
  corrections: many(corrections),
}));

export const punchRecords = pgTable("punch_records", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  punchTime: timestamp("punch_time", { withTimezone: true }).defaultNow(),
  type: text("type"),
});

export type PunchRecord = typeof punchRecords.$inferSelect;
export const punchRecordsRelations = relations(
  punchRecords,
  ({ one, many }) => ({
    users: one(users, {
      fields: [punchRecords.userId],
      references: [users.id],
    }),
    punchRecordsCorrections: many(punchRecordsCorrections),
  })
);

export const corrections = pgTable("corrections", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  correctionDate: date("correction_date"),
  status: text("status"),
  reason: text("reason"),
  statusUpdatedBy: uuid("status_updated_by").references(() => users.id, {
    onDelete: "set null",
  }),
  statusUpdatedDate: timestamp("status_updated_date", { withTimezone: true }),
});

export const correctionsRelations = relations(corrections, ({ one, many }) => ({
  users: one(users, {
    fields: [corrections.userId],
    references: [users.id],
  }),
  punchRecordsCorrections: many(punchRecordsCorrections),
}));

export const punchRecordsCorrections = pgTable(
  "punch_records_corrections",
  {
    punchRecordId: uuid("punch_record_id").references(() => punchRecords.id, {
      onDelete: "cascade",
    }),

    correctionId: uuid("correction_id").references(() => corrections.id, {
      onDelete: "cascade",
    }),
    action: text("action"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.punchRecordId, t.correctionId] }),
  })
);

export const punchRecordsCorrectionsRelations = relations(
  punchRecordsCorrections,
  ({ one }) => ({
    punchRecords: one(punchRecords, {
      fields: [punchRecordsCorrections.punchRecordId],
      references: [punchRecords.id],
    }),
    corrections: one(corrections, {
      fields: [punchRecordsCorrections.correctionId],
      references: [corrections.id],
    }),
  })
);
