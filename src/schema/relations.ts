

import { relations } from "drizzle-orm";
import { userRoles, users } from "./users";
import { serviceTokens, sessions } from "./tokens";
import { applications, applicationRedirectUris } from "./applications";
import { permissions, roles } from "./roles";
import { rolePermissions } from "./roles";

/* =========================================================
   RELATIONS
========================================================= */

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