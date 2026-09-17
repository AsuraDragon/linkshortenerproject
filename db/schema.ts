import { pgTable, text, varchar, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const links = pgTable(
    "links",
    {
        id: uuid("id")
            .primaryKey()
            .$defaultFn(() => uuidv7()),
        userId: text("user_id").notNull(),
        url: text("url").notNull(),
        code: varchar("code", { length: 20 }).notNull().unique(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
    },
    (table) => [index("links_user_id_idx").on(table.userId), index("links_code_idx").on(table.code)],
);

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
