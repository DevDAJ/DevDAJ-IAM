
import {
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    varchar
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { identityProviderEnum } from "./enums";

/* =========================================================
   IDENTITIES
========================================================= */

export const identities = pgTable(
    "identities",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        userId: uuid("user_id")
            .references(() => users.id, {
                onDelete: "cascade",
            })
            .notNull(),

        provider: identityProviderEnum("provider").notNull(),

        providerUserId: varchar("provider_user_id", {
            length: 255,
        }),

        passwordHash: text("password_hash"),

        accessToken: text("access_token"),

        refreshToken: text("refresh_token"),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [({
        providerUserIdx: uniqueIndex(
            "identities_provider_user_idx"
        ).on(table.provider, table.providerUserId),

        userProviderIdx: uniqueIndex(
            "identities_user_provider_idx"
        ).on(table.userId, table.provider),
    })]
);
