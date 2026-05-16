import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { db } from "./db";
import * as schema from "../schema/auth-schema";
import { users } from "../schema/users";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            ...schema,
            user: users,
        }
    }),
});