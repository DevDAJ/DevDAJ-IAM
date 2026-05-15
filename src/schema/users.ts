
import {
    boolean,
    index,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    varchar
} from "drizzle-orm/pg-core";
import { applications } from "./applications";
import { roles } from "./roles";

export const users = pgTable(
    "users",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        email: varchar("email", { length: 255 }).notNull().unique(),

        emailVerified: boolean("email_verified")
            .default(false)
            .notNull(),

        displayName: varchar("display_name", { length: 255 }),

        avatarUrl: text("avatar_url"),

        isActive: boolean("is_active")
            .default(true)
            .notNull(),

        isBanned: boolean("is_banned")
            .default(false)
            .notNull(),

        lastLoginAt: timestamp("last_login_at", {
            withTimezone: true,
        }),

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
        emailIdx: uniqueIndex("users_email_idx").on(table.email),
    })]
);


/* =========================================================
   USER ROLES
========================================================= */

export const userRoles = pgTable(
    "user_roles",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        userId: uuid("user_id")
            .references(() => users.id, {
                onDelete: "cascade",
            })
            .notNull(),

        roleId: uuid("role_id")
            .references(() => roles.id, {
                onDelete: "cascade",
            })
            .notNull(),

        grantedByApplicationId: uuid(
            "granted_by_application_id"
        ).references(() => applications.id),

        expiresAt: timestamp("expires_at", {
            withTimezone: true,
        }),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [({
        userRoleIdx: uniqueIndex("user_roles_unique_idx").on(
            table.userId,
            table.roleId
        ),

        expiresIdx: index("user_roles_expires_idx").on(
            table.expiresAt
        ),
    })]
);