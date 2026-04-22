import { useEffect } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { authClient } from "@/lib/auth-client";

function roleIsAdmin(role: string | null | undefined): boolean {
  if (!role) return false;
  return role
    .split(",")
    .map((r) => r.trim())
    .includes("admin");
}

export function DashboardLayout() {
  const { data: session, isPending } = authClient.useSession();
  const loc = useLocation();

  useEffect(() => {
    document.title = "Dashboard · DevDAJ IAM";
  }, []);

  if (isPending) {
    return (
      <div className="shell">
        <p className="muted">Loading session…</p>
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  }

  const admin = roleIsAdmin(session.user.role);

  if (loc.pathname.startsWith("/app/admin") && !admin) {
    return <Navigate to="/app/home" replace />;
  }

  return (
    <div className="shell">
      <header className="nav">
        <Link to="/app/home" className="nav-brand">
          DevDAJ IAM
        </Link>
        <nav className="nav-links">
          <Link to="/app/home">Home</Link>
          <Link to="/app/settings">Account</Link>
          {admin ? (
            <>
              <Link to="/app/admin/users">Users</Link>
              <Link to="/app/admin/scopes">Scopes</Link>
              <Link to="/app/admin/api-keys">API keys</Link>
            </>
          ) : null}
          <button type="button" className="btn btn-ghost" onClick={() => authClient.signOut()}>
            Sign out
          </button>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
