
import {
    index,
    jsonb,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { applications } from "./applications";
import { auditActorTypeEnum } from "./enums";

/* =========================================================
   SESSIONS
========================================================= */

export const sessions = pgTable(
    "sessions",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        userId: uuid("user_id")
            .references(() => users.id, {
                onDelete: "cascade",
            })
            .notNull(),

        refreshTokenHash: text(
            "refresh_token_hash"
        ).notNull(),

        ipAddress: varchar("ip_address", {
            length: 255,
        }),

        userAgent: text("user_agent"),

        expiresAt: timestamp("expires_at", {
            withTimezone: true,
        }).notNull(),

        revokedAt: timestamp("revoked_at", {
            withTimezone: true,
        }),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    }
);

/* =========================================================
   SERVICE TOKENS
========================================================= */

export const serviceTokens = pgTable(
    "service_tokens",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        applicationId: uuid("application_id")
            .references(() => applications.id, {
                onDelete: "cascade",
            })
            .notNull(),

        name: varchar("name", {
            length: 255,
        }).notNull(),

        secretHash: text("secret_hash").notNull(),

        lastUsedAt: timestamp("last_used_at", {
            withTimezone: true,
        }),

        expiresAt: timestamp("expires_at", {
            withTimezone: true,
        }),

        revokedAt: timestamp("revoked_at", {
            withTimezone: true,
        }),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    }
);

/* =========================================================
   AUDIT LOGS
========================================================= */

export const auditLogs = pgTable(
    "audit_logs",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        actorType: auditActorTypeEnum(
            "actor_type"
        ).notNull(),

        actorId: uuid("actor_id"),

        action: varchar("action", {
            length: 255,
        }).notNull(),

        targetType: varchar("target_type", {
            length: 255,
        }).notNull(),

        targetId: uuid("target_id"),

        metadata: jsonb("metadata"),

        ipAddress: varchar("ip_address", {
            length: 255,
        }),

        userAgent: text("user_agent"),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [({
        actionIdx: index("audit_logs_action_idx").on(
            table.action
        ),

        createdAtIdx: index(
            "audit_logs_created_at_idx"
        ).on(table.createdAt),
    })]
);
