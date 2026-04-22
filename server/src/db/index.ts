export type { AppDatabaseHandler, ExternalApiKeyRow, ScopeDefinitionRow } from "./types";
export { hashApiKey, generateApiKey } from "./crypto";
export { createBunSqliteAppDatabaseHandler } from "./handlers/bun-sqlite.handler";

import path from "node:path";
import type { AppDatabaseHandler } from "./types";
import { createBunSqliteAppDatabaseHandler } from "./handlers/bun-sqlite.handler";

let _app: AppDatabaseHandler | null = null;

/** Clears the cached handler (for tests only). */
export function resetAppDatabaseForTesting(): void {
  void _app?.close?.();
  _app = null;
}

/** Call once at process startup before using IAM helpers. */
export async function initAppDatabase(): Promise<AppDatabaseHandler> {
  if (_app) return _app;
  const databasePath =
    process.env.APP_DATABASE_PATH ??
    process.env.AUTH_DATABASE_PATH ??
    path.join(process.cwd(), "data", "auth.db");
  _app = createBunSqliteAppDatabaseHandler({ databasePath });
  return _app;
}

export function getAppDatabaseHandler(): AppDatabaseHandler {
  if (!_app) {
    throw new Error("initAppDatabase() must be called before accessing the app database");
  }
  return _app;
}

export function listScopeDefinitions() {
  return getAppDatabaseHandler().listScopeDefinitions();
}

export function createScopeDefinition(
  input: Parameters<AppDatabaseHandler["createScopeDefinition"]>[0],
) {
  return getAppDatabaseHandler().createScopeDefinition(input);
}

export function deleteScopeDefinition(id: string) {
  return getAppDatabaseHandler().deleteScopeDefinition(id);
}

export function getUserScopeKeys(userId: string) {
  return getAppDatabaseHandler().getUserScopeKeys(userId);
}

export function setUserScopes(userId: string, scopeIds: string[]) {
  return getAppDatabaseHandler().setUserScopes(userId, scopeIds);
}

export function validateExternalApiKey(raw: string) {
  return getAppDatabaseHandler().validateExternalApiKey(raw);
}

export function createExternalApiKey(
  input: Parameters<AppDatabaseHandler["createExternalApiKey"]>[0],
) {
  return getAppDatabaseHandler().createExternalApiKey(input);
}

export function listExternalApiKeys() {
  return getAppDatabaseHandler().listExternalApiKeys();
}

export function revokeExternalApiKey(id: string) {
  return getAppDatabaseHandler().revokeExternalApiKey(id);
}
