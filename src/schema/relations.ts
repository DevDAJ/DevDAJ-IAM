

import { relations } from "drizzle-orm";
import { userRoles, users } from "./users";
import { identities } from "./identities";
import { serviceTokens, sessions } from "./tokens";
import { applications, applicationRedirectUris } from "./applications";
import { permissions, roles } from "./roles";
import { rolePermissions } from "./roles";

/* =========================================================
   RELATIONS
========================================================= */

export const usersRelations = relations(
    users,
    ({ many }) => ({
        identities: many(identities),
        sessions: many(sessions),
        userRoles: many(userRoles),
    })
);

export const identitiesRelations = relations(
    identities,
    ({ one }) => ({
        user: one(users, {
            fields: [identities.userId],
            references: [users.id],
        }),
    })
);

export const applicationsRelations = relations(
    applications,
    ({ many }) => ({
        redirectUris: many(applicationRedirectUris),
        roles: many(roles),
        serviceTokens: many(serviceTokens),
    })
);

export const rolesRelations = relations(
    roles,
    ({ many, one }) => ({
        permissions: many(rolePermissions),

        application: one(applications, {
            fields: [roles.applicationId],
            references: [applications.id],
        }),

        userRoles: many(userRoles),
    })
);

export const permissionsRelations = relations(
    permissions,
    ({ many }) => ({
        rolePermissions: many(rolePermissions),
    })
);