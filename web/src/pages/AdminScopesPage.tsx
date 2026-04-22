import { FormEvent, useEffect, useState } from "react";

type ScopeRow = {
  id: string;
  key: string;
  label: string;
  description: string | null;
};

export function AdminScopesPage() {
  const [scopes, setScopes] = useState<ScopeRow[]>([]);
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/admin/scopes", { credentials: "include" });
    if (!res.ok) return;
    const j = (await res.json()) as { scopes: ScopeRow[] };
    setScopes(j.scopes);
  }

  useEffect(() => {
    document.title = "Scopes · Admin";
    refresh();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/admin/scopes", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, label, description: description || undefined }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { message?: string };
      setErr(j.message ?? "Could not create scope");
      return;
    }
    setKey("");
    setLabel("");
    setDescription("");
    await refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this scope? User assignments will be removed.")) return;
    await fetch(`/api/admin/scopes/${id}`, { method: "DELETE", credentials: "include" });
    await refresh();
  }

  return (
    <div>
      <h1>Scope catalog</h1>
      <p className="muted">
        Define scope keys for subscription tiers and connected apps. Admins create keys here; user
        assignments happen under User management.
      </p>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Add scope</h2>
        <form onSubmit={onCreate} className="grid2" style={{ marginTop: "0.75rem" }}>
          <label>
            Key (stable id, e.g. app:pro)
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
              placeholder="namespace:feature"
            />
          </label>
          <label>
            Label
            <input value={label} onChange={(e) => setLabel(e.target.value)} required />
          </label>
          <label style={{ gridColumn: "1 / -1" }}>
            Description
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="optional"
            />
          </label>
          {err ? (
            <p className="err" style={{ gridColumn: "1 / -1" }}>
              {err}
            </p>
          ) : null}
          <button type="submit" className="btn btn-primary" style={{ marginTop: "0.25rem" }}>
            Create scope
          </button>
        </form>
      </section>

      <div className="table-wrap card" style={{ marginTop: "1.25rem", padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Label</th>
              <th>Description</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {scopes.map((s) => (
              <tr key={s.id}>
                <td>
                  <span className="code">{s.key}</span>
                </td>
                <td>{s.label}</td>
                <td className="muted">{s.description ?? "—"}</td>
                <td>
                  <button type="button" className="btn btn-ghost" onClick={() => remove(s.id)}>
                    Delete
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
