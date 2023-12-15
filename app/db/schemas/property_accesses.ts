import { bigint, pgTable, serial, uuid } from "drizzle-orm/pg-core";
import { users } from ".";
import { relations } from "drizzle-orm";

export const propertyAccesses = pgTable("property_accesses", {
  id: serial("id").primaryKey(),
  userId: uuid("userId").notNull().references(() => users.id),
  propertyId: bigint("property_id", { mode: "number" }).notNull(),
});

export const propertyAccessesRelations = relations(propertyAccesses, ({ one}) => ({
  user: one(users, {
    fields: [propertyAccesses.userId],
    references: [users.id],
  }),
}));

export type PropertyAccess = typeof propertyAccesses.$inferSelect;
export type InsertPropertyAccess = typeof propertyAccesses.$inferInsert;