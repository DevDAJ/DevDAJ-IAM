import {
    pgEnum
} from "drizzle-orm/pg-core";


/* =========================================================
   ENUMS
========================================================= */

export const identityProviderEnum = pgEnum("identity_provider", [
    "local",
    "google",
    "github",
    "discord",
    "microsoft",
    "apple",
]);

export const tokenTypeEnum = pgEnum("token_type", [
    "access",
    "refresh",
    "service",
]);

export const auditActorTypeEnum = pgEnum("audit_actor_type", [
    "user",
    "service",
    "system",
]);
