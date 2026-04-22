import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

type ListedUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
};

type ScopeDef = {
  id: string;
  key: string;
  label: string;
};

export function AdminUsersPage() {
  const { data: session } = authClient.useSession();
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [definitions, setDefinitions] = useState<ScopeDef[]>([]);
  const [assigned, setAssigned] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/auth/admin/list-users?limit=200", {
      credentials: "include",
    });
    if (!res.ok) {
      setUsers([]);
      setLoading(false);
      return;
    }
    const json = (await res.json()) as { users?: ListedUser[] };
    setUsers(json.users ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    document.title = "Users · Admin";
    loadUsers();
  }, [loadUsers]);

  const loadScopesFor = async (userId: string) => {
    setSelected(userId);
    const res = await fetch(`/api/admin/users/${userId}/scopes`, {
      credentials: "include",
    });
    if (!res.ok) return;
    const j = (await res.json()) as {
      definitions: ScopeDef[];
      assignedIds: string[];
    };
    setDefinitions(j.definitions);
    setAssigned(j.assignedIds);
  };

  async function saveScopes() {
    if (!selected) return;
    setSaving(true);
    await fetch(`/api/admin/users/${selected}/scopes`, {
      method: "PUT",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scopeIds: assigned }),
    });
    setSaving(false);
  }

  function toggleScope(id: string, checked: boolean) {
    setAssigned((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  }

  const admin = session?.user?.id;

  return (
    <div>
      <h1>User management</h1>
      <p className="muted">
        Search and list users (via Better Auth admin). Assign subscription scopes with checkboxes;
        only administrators can view or edit scopes.
      </p>

      {loading ? (
        <p className="muted">Loading users…</p>
      ) : (
        <div className="table-wrap card" style={{ marginTop: "1rem", padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="pill">{u.role ?? "user"}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => loadScopesFor(u.id)}
                    >
                      Scopes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected ? (
        <section className="card" style={{ marginTop: "1.25rem" }}>
          <h2>Scopes for user</h2>
          <p className="muted">
            User id <span className="code">{selected}</span>
            {admin === selected ? (
              <>
                {" "}
                (you — scopes still managed here for testing; in production avoid locking yourself
                out.)
              </>
            ) : null}
          </p>
          <div className="checkbox-grid" style={{ marginTop: "0.75rem" }}>
            {definitions.map((d) => (
              <label key={d.id} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={assigned.includes(d.id)}
                  onChange={(e) => toggleScope(d.id, e.target.checked)}
                />
                <span>
                  <strong>{d.label}</strong> <span className="muted">({d.key})</span>
                </span>
              </label>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: "1rem" }}
            disabled={saving}
            onClick={() => saveScopes()}
          >
            {saving ? "Saving…" : "Save scopes"}
          </button>
        </section>
      ) : null}
    </div>
  );
}
