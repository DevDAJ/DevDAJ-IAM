import { FormEvent, useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

type AccountRow = {
  id: string;
  providerId: string;
  accountId: string;
};

export function SettingsPage() {
  const { data: session, refetch } = authClient.useSession();
  const [accounts, setAccounts] = useState<AccountRow[] | null>(null);
  const [providers, setProviders] = useState<{ google: boolean; github: boolean } | null>(null);
  const [username, setUsername] = useState("");
  const [displayUsername, setDisplayUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    const res = await fetch("/api/auth/list-accounts", { credentials: "include" });
    if (!res.ok) {
      setAccounts([]);
      return;
    }
    const data = (await res.json()) as AccountRow[];
    setAccounts(data);
  }, []);

  useEffect(() => {
    document.title = "Account · DevDAJ IAM";
    fetch("/api/app/providers")
      .then((r) => r.json())
      .then((j) => setProviders(j as { google: boolean; github: boolean }))
      .catch(() => setProviders({ google: false, github: false }));
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    const u = session?.user as { username?: string; displayUsername?: string } | undefined;
    if (u?.username) setUsername(u.username);
    if (u?.displayUsername) setDisplayUsername(u.displayUsername);
  }, [session?.user]);

  const hasCredential = accounts?.some((a) => a.providerId === "credential");

  async function linkProvider(provider: "google" | "github") {
    setErr(null);
    setMsg(null);
    const res = await fetch("/api/auth/link-social", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        provider,
        callbackURL: `${window.location.origin}/app/settings`,
      }),
    });
    const data = (await res.json()) as { url?: string; redirect?: boolean };
    if (!res.ok) {
      setErr((data as { message?: string }).message ?? "Link failed");
      return;
    }
    if (data.url) window.location.href = data.url;
    else {
      setMsg("Provider linked.");
      await loadAccounts();
      await refetch();
    }
  }

  async function onUpdateProfile(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    const res = await fetch("/api/auth/update-user", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: username || undefined,
        displayUsername: displayUsername || undefined,
      }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { message?: string };
      setErr(j.message ?? "Update failed");
      return;
    }
    setMsg("Profile updated.");
    await refetch();
  }

  async function onSetPassword(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (hasCredential) {
      setErr("Password already set — use change password in the auth UI if implemented.");
      return;
    }
    const res = await fetch("/api/app/account/set-password", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { message?: string };
      setErr(j.message ?? "Could not set password");
      return;
    }
    setNewPassword("");
    setMsg("Password saved. You can now sign in with email and password.");
    await loadAccounts();
  }

  return (
    <div>
      <h1>Account settings</h1>
      <p className="muted">
        Link OAuth providers to an email account, or set a username and password if you signed up
        with an external provider.
      </p>

      {msg ? (
        <p className="ok" style={{ marginTop: "0.75rem" }}>
          {msg}
        </p>
      ) : null}
      {err ? (
        <p className="err" style={{ marginTop: "0.75rem" }}>
          {err}
        </p>
      ) : null}

      <div className="grid2" style={{ marginTop: "1.25rem" }}>
        <section className="card">
          <h2>Linked sign-in methods</h2>
          {accounts ? (
            <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.1rem" }}>
              {accounts.map((a) => (
                <li key={a.id}>
                  <span className="code">{a.providerId}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Loading…</p>
          )}
          {providers && (providers.google || providers.github) ? (
            <div className="row" style={{ marginTop: "1rem" }}>
              {providers.google ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => linkProvider("google")}
                >
                  Link Google
                </button>
              ) : null}
              {providers.github ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => linkProvider("github")}
                >
                  Link GitHub
                </button>
              ) : null}
            </div>
          ) : (
            <p className="muted" style={{ marginTop: "0.75rem" }}>
              Configure OAuth on the server to enable linking.
            </p>
          )}
        </section>

        <section className="card">
          <h2>Username</h2>
          <form onSubmit={onUpdateProfile}>
            <label>
              Username (unique)
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="optional"
                autoComplete="username"
              />
            </label>
            <label style={{ marginTop: "0.65rem" }}>
              Display name
              <input
                value={displayUsername}
                onChange={(e) => setDisplayUsername(e.target.value)}
                placeholder="optional"
              />
            </label>
            <button type="submit" className="btn btn-primary" style={{ marginTop: "0.85rem" }}>
              Save profile
            </button>
          </form>
        </section>

        <section className="card">
          <h2>Password</h2>
          {hasCredential ? (
            <p className="muted">
              A password is already set for this account. Use change-password flows from Better Auth
              if you need to rotate it.
            </p>
          ) : (
            <form onSubmit={onSetPassword}>
              <p className="muted" style={{ marginBottom: "0.65rem" }}>
                Add a password so you can sign in with email and password as well as OAuth.
              </p>
              <label>
                New password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </label>
              <button type="submit" className="btn btn-primary" style={{ marginTop: "0.85rem" }}>
                Set password
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
