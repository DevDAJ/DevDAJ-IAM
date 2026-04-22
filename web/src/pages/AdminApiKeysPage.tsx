import { FormEvent, useEffect, useState } from "react";

type KeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  can_manage_users: boolean;
  created_at: number;
};

export function AdminApiKeysPage() {
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [name, setName] = useState("");
  const [canManage, setCanManage] = useState(true);
  const [createdOnce, setCreatedOnce] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/admin/api-keys", { credentials: "include" });
    if (!res.ok) return;
    const j = (await res.json()) as { keys: KeyRow[] };
    setKeys(j.keys);
  }

  useEffect(() => {
    document.title = "API keys · Admin";
    refresh();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/api-keys", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, can_manage_users: canManage }),
    });
    if (!res.ok) return;
    const j = (await res.json()) as { apiKey?: string; message?: string };
    if (j.apiKey) setCreatedOnce(j.apiKey);
    setName("");
    await refresh();
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this API key?")) return;
    await fetch(`/api/admin/api-keys/${id}`, { method: "DELETE", credentials: "include" });
    await refresh();
  }

  return (
    <div>
      <h1>External API keys</h1>
      <p className="muted">
        Keys authenticate the HTTP APIs under <span className="code">/api/v1/external/*</span> for
        partner applications (user lookup and scope updates).
      </p>

      {createdOnce ? (
        <div className="card" style={{ marginTop: "1rem", borderColor: "var(--ok)" }}>
          <h2>New key (copy now)</h2>
          <p className="code" style={{ marginTop: "0.5rem" }}>
            {createdOnce}
          </p>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ marginTop: "0.75rem" }}
            onClick={() => setCreatedOnce(null)}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Create key</h2>
        <form onSubmit={onCreate} style={{ marginTop: "0.75rem" }}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="checkbox-row" style={{ marginTop: "0.65rem" }}>
            <input
              type="checkbox"
              checked={canManage}
              onChange={(e) => setCanManage(e.target.checked)}
            />
            <span>Allow user &amp; scope management endpoints</span>
          </label>
          <button type="submit" className="btn btn-primary" style={{ marginTop: "0.85rem" }}>
            Generate key
          </button>
        </form>
      </section>

      <div className="table-wrap card" style={{ marginTop: "1.25rem", padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Prefix</th>
              <th>Can manage users</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id}>
                <td>{k.name}</td>
                <td>
                  <span className="code">{k.key_prefix}…</span>
                </td>
                <td>{k.can_manage_users ? "yes" : "no"}</td>
                <td>
                  <button type="button" className="btn btn-ghost" onClick={() => revoke(k.id)}>
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
