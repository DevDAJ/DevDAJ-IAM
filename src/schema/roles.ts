
import {
    pgTable,
    primaryKey,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    varchar
} from "drizzle-orm/pg-core";
import { applications } from "./applications";

/* =========================================================
   ROLES
========================================================= */

export const roles = pgTable(
    "roles",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        name: varchar("name", { length: 100 })
            .notNull(),

        slug: varchar("slug", { length: 100 })
            .notNull(),

        description: text("description"),

        applicationId: uuid("application_id").references(
            () => applications.id,
            {
                onDelete: "cascade",
            }
        ),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [({
        roleSlugIdx: uniqueIndex("roles_slug_idx").on(
            table.slug,
            table.applicationId
        ),
    })]
);

/* =========================================================
   PERMISSIONS
========================================================= */

export const permissions = pgTable(
    "permissions",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        name: varchar("name", {
            length: 255,
        }).notNull(),

        slug: varchar("slug", {
            length: 255,
        })
            .notNull()
            .unique(),

        description: text("description"),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    }
);

/* =========================================================
   ROLE PERMISSIONS
========================================================= */

export const rolePermissions = pgTable(
    "role_permissions",
    {
        roleId: uuid("role_id")
            .references(() => roles.id, {
                onDelete: "cascade",
            })
            .notNull(),

        permissionId: uuid("permission_id")
            .references(() => permissions.id, {
                onDelete: "cascade",
            })
            .notNull(),
    },
    (table) => [({
        pk: primaryKey({
            columns: [table.roleId, table.permissionId],
        }),
    })]
);