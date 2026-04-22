/** Application-owned data (scopes, external API keys) — separate from Better Auth tables. */

export type ScopeDefinitionRow = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  created_at: number;
};

export type ExternalApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  can_manage_users: boolean;
  created_at: number;
};

/** Persists IAM catalog data (subscription scopes, partner API keys) in SQLite. */
export interface AppDatabaseHandler {
  readonly id: string;

  listScopeDefinitions(): Promise<ScopeDefinitionRow[]>;

  createScopeDefinition(input: {
    key: string;
    label: string;
    description?: string | null;
  }): Promise<ScopeDefinitionRow>;

  deleteScopeDefinition(id: string): Promise<boolean>;

  getUserScopeKeys(userId: string): Promise<string[]>;

  setUserScopes(userId: string, scopeIds: string[]): Promise<void>;

  validateExternalApiKey(raw: string): Promise<{
    id: string;
    name: string;
    can_manage_users: boolean;
  } | null>;

  createExternalApiKey(input: {
    name: string;
    can_manage_users: boolean;
  }): Promise<{ rawKey: string; prefix: string; id: string }>;

  listExternalApiKeys(): Promise<ExternalApiKeyRow[]>;

  revokeExternalApiKey(id: string): Promise<boolean>;

  /** Optional teardown (e.g. close pool). */
  close?(): Promise<void> | void;
}
