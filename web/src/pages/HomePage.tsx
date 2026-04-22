import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { authClient } from "@/lib/auth-client";

type GeoHeaders = {
  ip: string;
  source: string;
  geo?: { country?: string; city?: string; lat?: number; lon?: number } | null;
};
type GeoBrowser = {
  latitude: number;
  longitude: number;
  accuracy?: number;
} | null;

export function HomePage() {
  const { pathname } = useLocation();
  const inApp = pathname.startsWith("/app");
  const { data: session, isPending } = authClient.useSession();
  const [headerGeo, setHeaderGeo] = useState<GeoHeaders | null>(null);
  const [browserGeo, setBrowserGeo] = useState<GeoBrowser | null>(null);
  const [geoErr, setGeoErr] = useState<string | null>(null);

  useEffect(() => {
    document.title = "DevDAJ IAM";
  }, []);

  useEffect(() => {
    fetch("/api/app/geo", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => setHeaderGeo(j as GeoHeaders))
      .catch(() => setHeaderGeo(null));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoErr("Browser geolocation is not available.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBrowserGeo({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setGeoErr(null);
      },
      (e) => setGeoErr(e.message || "Location permission denied or unavailable."),
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 60_000 },
    );
  }, []);

  const authed = Boolean(session?.user);

  return (
    <div className="shell">
      {!inApp ? (
        <header className="nav">
          <span className="nav-brand">DevDAJ IAM</span>
          <nav className="nav-links">
            {!isPending && !authed ? (
              <>
                <Link to="/login">Sign in</Link>
                <Link to="/register">Register</Link>
              </>
            ) : null}
            {!isPending && authed ? (
              <>
                <Link to="/app/home">Dashboard</Link>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => authClient.signOut()}
                >
                  Sign out
                </button>
              </>
            ) : null}
          </nav>
        </header>
      ) : null}

      <div className="grid2">
        <section className="card">
          <h1>{inApp ? "Welcome back" : "Identity & access"}</h1>
          <p className="muted">
            {inApp
              ? "Your overview and location context. Subscription scopes are managed by administrators and are not visible here."
              : "Register with email or sign in with Google or GitHub. Admins manage subscription-style scopes for connected applications; OAuth users can add a password and username from account settings."}
          </p>
          {!inApp && !authed ? (
            <p className="row" style={{ marginTop: "1rem" }}>
              <Link className="btn btn-primary" to="/register">
                Create account
              </Link>
              <Link className="btn btn-ghost" to="/login">
                Sign in
              </Link>
            </p>
          ) : null}
          {!inApp && authed ? (
            <p style={{ marginTop: "1rem" }}>
              <Link className="btn btn-primary" to="/app/settings">
                Open account settings
              </Link>
            </p>
          ) : null}
          {inApp ? (
            <p style={{ marginTop: "1rem" }} className="muted">
              Signed in as <strong>{session?.user.email ?? session?.user.name}</strong>
            </p>
          ) : null}
        </section>

        <section className="card">
          <h2>Location context</h2>
          <p className="muted">
            Request IP (from proxy headers when available) and optional browser coordinates when you
            allow location access.
          </p>
          <div style={{ marginTop: "0.75rem" }}>
            <div className="pill">Server / network</div>
            <p style={{ marginTop: "0.5rem" }}>
              {headerGeo ? (
                <>
                  <span className="code">{headerGeo.ip}</span>
                  <span className="muted" style={{ marginLeft: "0.5rem" }}>
                    ({headerGeo.source})
                  </span>
                  {headerGeo.geo?.country ? (
                    <span style={{ display: "block", marginTop: "0.35rem" }}>
                      {headerGeo.geo.city ? `${headerGeo.geo.city}, ` : null}
                      {headerGeo.geo.country}
                      {headerGeo.geo.lat != null && headerGeo.geo.lon != null ? (
                        <span className="muted">
                          {" "}
                          · {headerGeo.geo.lat.toFixed(2)}, {headerGeo.geo.lon.toFixed(2)}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="muted">Loading…</span>
              )}
            </p>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <div className="pill">Browser geolocation</div>
            {browserGeo ? (
              <p style={{ marginTop: "0.5rem" }}>
                <span className="code">
                  {browserGeo.latitude.toFixed(5)}, {browserGeo.longitude.toFixed(5)}
                </span>
                {browserGeo.accuracy != null ? (
                  <span className="muted" style={{ marginLeft: "0.5rem" }}>
                    ±{Math.round(browserGeo.accuracy)}m
                  </span>
                ) : null}
              </p>
            ) : (
              <p className="muted" style={{ marginTop: "0.5rem" }}>
                {geoErr ?? "Waiting for permission…"}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
