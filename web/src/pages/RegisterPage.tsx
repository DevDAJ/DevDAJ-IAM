import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";

export function RegisterPage() {
  const { data: session } = authClient.useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [providers, setProviders] = useState<{ google: boolean; github: boolean } | null>(null);

  useEffect(() => {
    document.title = "Register · DevDAJ IAM";
    fetch("/api/app/providers")
      .then((r) => r.json())
      .then((j) => setProviders(j as { google: boolean; github: boolean }))
      .catch(() => setProviders({ google: false, github: false }));
  }, []);

  if (session?.user) {
    return <Navigate to="/app/home" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/app/home",
    });
    setBusy(false);
    if (error) {
      setErr(error.message ?? "Registration failed");
      return;
    }
    window.location.href = "/app/home";
  }

  async function social(provider: "google" | "github") {
    setErr(null);
    await authClient.signIn.social({
      provider,
      callbackURL: "/app/home",
    });
  }

  return (
    <div className="shell" style={{ maxWidth: 440 }}>
      <Link to="/" className="muted">
        ← Home
      </Link>
      <div className="card" style={{ marginTop: "1rem" }}>
        <h1>Create account</h1>
        <p className="muted">Email registration or sign up with a provider.</p>

        {providers && (providers.google || providers.github) ? (
          <div className="row" style={{ marginTop: "1rem" }}>
            {providers.google ? (
              <button type="button" className="btn btn-ghost" onClick={() => social("google")}>
                Google
              </button>
            ) : null}
            {providers.github ? (
              <button type="button" className="btn btn-ghost" onClick={() => social("github")}>
                GitHub
              </button>
            ) : null}
          </div>
        ) : null}

        <form onSubmit={onSubmit} style={{ marginTop: "1.25rem" }}>
          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </label>
          <label style={{ marginTop: "0.75rem" }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label style={{ marginTop: "0.75rem" }}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
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
            {busy ? "Creating…" : "Register"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: "1rem" }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
