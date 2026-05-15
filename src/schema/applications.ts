
import {
    boolean,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    varchar
} from "drizzle-orm/pg-core";
import { users } from "./users";

/* =========================================================
   APPLICATIONS
========================================================= */

export const applications = pgTable(
    "applications",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        name: varchar("name", { length: 255 }).notNull(),

        slug: varchar("slug", { length: 100 })
            .notNull()
            .unique(),

        description: text("description"),

        clientId: varchar("client_id", {
            length: 255,
        })
            .notNull()
            .unique(),

        clientSecretHash: text("client_secret_hash").notNull(),

        ownerUserId: uuid("owner_user_id").references(
            () => users.id,
            {
                onDelete: "set null",
            }
        ),

        isActive: boolean("is_active")
            .default(true)
            .notNull(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),

        updatedAt: timestamp("updated_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [({
        slugIdx: uniqueIndex("applications_slug_idx").on(
            table.slug
        ),

        clientIdIdx: uniqueIndex(
            "applications_client_id_idx"
        ).on(table.clientId),
    })]
);

/* =========================================================
   APPLICATION REDIRECT URIS
========================================================= */

export const applicationRedirectUris = pgTable(
    "application_redirect_uris",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        applicationId: uuid("application_id")
            .references(() => applications.id, {
                onDelete: "cascade",
            })
            .notNull(),

        uri: text("uri").notNull(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    }
);

