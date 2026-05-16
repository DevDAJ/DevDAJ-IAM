import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { db } from "./db";
import * as schema from "../schema/auth-schema";
import { users } from "../schema/users";
import { openAPI } from "better-auth/plugins";

export const auth = betterAuth({
    basePath: '/auth',
    emailAndPassword: {
        enabled: true,
        tokenDuration: 60 * 60 * 24, // 1 day in seconds
    },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            ...schema,
            user: users,
        }
    }),
    plugins: [openAPI()]
});

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema())
export const OpenAPI = {
    getPaths: (prefix = '/api/v1/auth') =>
        getSchema().then(({ paths }) => {
            const reference: typeof paths = Object.create(null)
            for (const path of Object.keys(paths)) {
                const key = prefix + path
                reference[key] = paths[path]
                for (const method of Object.keys(paths[path])) {
                    const operation = (reference[key] as any)[method]
                    operation.tags = ['Authentication Routes']
                }
            }
            return reference
        }) as Promise<any>,
    components: getSchema().then(({ components }) => components) as Promise<any>
} as const