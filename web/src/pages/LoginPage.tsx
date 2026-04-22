import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { authClient } from "@/lib/auth-client";

export function LoginPage() {
  const { data: session } = authClient.useSession();
  const loc = useLocation();
  const from = (loc.state as { from?: string } | null)?.from ?? "/app/home";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [providers, setProviders] = useState<{ google: boolean; github: boolean } | null>(null);

  useEffect(() => {
    document.title = "Sign in · DevDAJ IAM";
    fetch("/api/app/providers")
      .then((r) => r.json())
      .then((j) => setProviders(j as { google: boolean; github: boolean }))
      .catch(() => setProviders({ google: false, github: false }));
  }, []);

  if (session?.user) {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: from,
    });
    setBusy(false);
    if (error) {
      setErr(error.message ?? "Sign in failed");
      return;
    }
    window.location.href = from;
  }

  async function social(provider: "google" | "github") {
    setErr(null);
    await authClient.signIn.social({
      provider,
      callbackURL: from,
    });
  }

  return (
    <div className="shell" style={{ maxWidth: 440 }}>
      <Link to="/" className="muted">
        ← Home
      </Link>
      <div className="card" style={{ marginTop: "1rem" }}>
        <h1>Sign in</h1>
        <p className="muted">Use email and password or an external provider.</p>

        {providers && (providers.google || providers.github) ? (
          <div className="row" style={{ marginTop: "1rem" }}>
            {providers.google ? (
              <button type="button" className="btn btn-ghost" onClick={() => social("google")}>
                Continue with Google
              </button>
            ) : null}
            {providers.github ? (
              <button type="button" className="btn btn-ghost" onClick={() => social("github")}>
                Continue with GitHub
              </button>
            ) : null}
          </div>
        ) : (
          <p className="muted" style={{ marginTop: "0.75rem" }}>
            OAuth buttons appear when Google/GitHub credentials are configured on the server.
          </p>
        )}

        <form onSubmit={onSubmit} style={{ marginTop: "1.25rem" }}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label style={{ marginTop: "0.75rem" }}>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {err ? (
            <p className="err" style={{ marginTop: "0.75rem" }}>
              {err}
            </p>
          ) : null}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: "1rem", width: "100%" }}
            disabled={busy}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: "1rem" }}>
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
