/**
 * vortexr — complete example
 *
 * Demonstrates everything:
 *   Week 1: scroll restoration, useNavigate, useMatch, Error Boundary
 *   Week 2: <Outlet /> for nested layouts
 */
import React, { type ReactNode } from "react";
import {
  Router,
  Link,
  NavLink,
  Navigate,
  Outlet,
  useNavigate,
  useMatch,
  useParams,
  useSearchParams,
  routerStore,
  defineRouteConfig,
  type RouteConfig,
  type GuardFn,
  type VortexrErrorFallback,
} from "vortexr";

// ─── Scroll config ────────────────────────────────────────────────────────────

routerStore.setScrollBehavior("top");

// ─── Guards ───────────────────────────────────────────────────────────────────

const isAuthenticated: GuardFn = () => Boolean(localStorage.getItem("token"));

const isAdmin: GuardFn = async () => {
  await new Promise((r) => setTimeout(r, 200));
  return localStorage.getItem("role") === "admin";
};

const hasRole =
  (role: string): GuardFn =>
  async () => {
    await new Promise((r) => setTimeout(r, 100));
    return localStorage.getItem("role") === role;
  };

// ─── Error Fallbacks ──────────────────────────────────────────────────────────

const GlobalErrorFallback: VortexrErrorFallback = ({ error, reset }) => (
  <div style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}>
    <h2>💥 Something broke</h2>
    <p style={{ color: "#666" }}>{error.message}</p>
    <button onClick={reset} style={{ marginRight: "1rem" }}>
      Try again
    </button>
    <Link to="/">← Home</Link>
  </div>
);

const AdminErrorFallback: VortexrErrorFallback = ({ error, reset }) => (
  <div style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}>
    <h2>🔐 Admin panel crashed</h2>
    <p style={{ color: "#c00" }}>{error.message}</p>
    <button onClick={reset}>Retry</button>
  </div>
);

// ─── Layouts ──────────────────────────────────────────────────────────────────

/**
 * RootLayout — wraps every page.
 * Uses <Outlet /> to render the matched child.
 */
function RootLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div>
      <nav
        style={{
          display: "flex",
          gap: "1.5rem",
          padding: "1rem 2rem",
          borderBottom: "1px solid #eee",
          alignItems: "center",
        }}
      >
        <NavLink to="/" activeClassName="nav-active">
          Home
        </NavLink>
        <NavLink to="/dashboard" activeClassName="nav-active">
          Dashboard
        </NavLink>
        <NavLink to="/users" activeClassName="nav-active">
          Users
        </NavLink>
        <NavLink to="/admin" activeClassName="nav-active">
          Admin
        </NavLink>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
          <button onClick={() => navigate(-1)}>← Back</button>
          <button onClick={() => navigate("/login")}>Login</button>
        </div>
      </nav>
      <main style={{ padding: "2rem" }}>
        {/* <Outlet /> renders the matched child route */}
        <Outlet />
        {/* children also works — both are equivalent */}
        {children}
      </main>
    </div>
  );
}

/**
 * DashboardLayout — used by all /dashboard/* routes.
 * Nested inside RootLayout automatically.
 */
function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "2rem" }}>
      <aside style={{ borderRight: "1px solid #eee", paddingRight: "2rem" }}>
        <p style={{ fontWeight: 700, marginBottom: "1rem" }}>Dashboard</p>
        <NavLink to="/dashboard" activeClassName="active" exact>
          Overview
        </NavLink>
        <br />
        <NavLink to="/dashboard/settings" activeClassName="active">
          Settings
        </NavLink>
        <br />
        <NavLink to="/dashboard/profile" activeClassName="active">
          Profile
        </NavLink>
      </aside>
      <section>
        {/* <Outlet /> renders the matched nested page */}
        <Outlet />
        {children}
      </section>
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────

function HomePage() {
  const navigate = useNavigate();
  const match = useMatch("/");
  return (
    <div>
      <h1>Welcome to vortexr 🌀</h1>
      <p>useMatch("/"): {match ? "✅ matched" : "❌"}</p>
      <button onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
      <button onClick={() => navigate("/dashboard", { replace: true })} style={{ marginLeft: "1rem" }}>
        Replace → Dashboard
      </button>
    </div>
  );
}

function DashboardPage() {
  return (
    <div>
      <h2>Dashboard Overview</h2>
      <p>Pick a section from the sidebar.</p>
    </div>
  );
}

function SettingsPage() {
  return <h2>⚙️ Settings</h2>;
}

function ProfilePage() {
  return <h2>👤 Profile</h2>;
}

function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get("page") ?? "1";
  return (
    <div>
      <h2>Users — Page {page}</h2>
      <button onClick={() => setSearchParams({ page: String(Number(page) + 1) })}>Next →</button>
      <ul>
        {[1, 2, 3].map((id) => (
          <li key={id}>
            <Link to={`/users/${id}`}>User #{id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const match = useMatch("/users/:id");
  return (
    <div>
      <h2>User #{id}</h2>
      <p>params from useMatch: {JSON.stringify(match?.params)}</p>
      <button onClick={() => navigate(-1)}>← Back</button>
    </div>
  );
}

function AdminPage() {
  return <h2>🔐 Admin Panel — access granted</h2>;
}

function LoginPage() {
  const navigate = useNavigate();
  return (
    <div>
      <h2>Login</h2>
      <button
        onClick={() => {
          localStorage.setItem("token", "abc");
          localStorage.setItem("role", "admin");
          navigate("/dashboard");
        }}
      >
        Login as Admin
      </button>
    </div>
  );
}

function ForbiddenPage() {
  return (
    <div>
      <h2>403 — Forbidden</h2>
      <p>You don't have permission to view this page.</p>
      <Link to="/">← Go Home</Link>
    </div>
  );
}

// This page always crashes — demos the Error Boundary
function BuggyPage(): ReactNode {
  throw new Error("💣 This component always crashes!");
}

function GuardLoader() {
  return <div style={{ padding: "2rem", textAlign: "center", color: "#999" }}>Checking permissions...</div>;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

const routes = defineRouteConfig([
  // ── Public ────────────────────────────────────────────────────────────────
  { path: "/", component: HomePage, layout: RootLayout },
  { path: "/login", component: LoginPage },
  { path: "/403", component: ForbiddenPage },

  // ── Crash demo (uses global errorFallback) ────────────────────────────────
  { path: "/crash", component: BuggyPage, layout: RootLayout },

  // ── Protected: single guard ───────────────────────────────────────────────
  {
    path: "/users",
    component: UsersPage,
    layout: RootLayout,
    guard: isAuthenticated,
    redirectTo: "/login",
  },
  {
    path: "/users/:id",
    component: UserDetailPage,
    layout: RootLayout,
    guard: isAuthenticated,
    redirectTo: "/login",
  },

  // ── Protected: nested routes + Outlet ────────────────────────────────────
  //
  //   /dashboard          → RootLayout > DashboardLayout > DashboardPage
  //   /dashboard/settings → RootLayout > DashboardLayout > SettingsPage
  //   /dashboard/profile  → RootLayout > DashboardLayout > ProfilePage
  //
  //   isAuthenticated is defined once on the parent.
  //   Children inherit it automatically.
  {
    path: "/dashboard",
    component: DashboardPage,
    layout: RootLayout,
    guard: isAuthenticated,
    redirectTo: "/login",
    guardFallback: GuardLoader,
    children: [
      {
        path: "/settings",
        component: SettingsPage,
        layout: DashboardLayout,
        // ↑ isAuthenticated inherited from parent
      },
      {
        path: "/profile",
        component: ProfilePage,
        layout: DashboardLayout,
      },
    ],
  },

  // ── Admin: guard chain + per-route errorFallback ──────────────────────────
  {
    path: "/admin",
    component: AdminPage,
    layout: RootLayout,
    guards: [isAuthenticated, isAdmin],
    redirectTo: "/login",
    guardFallback: GuardLoader,
    errorFallback: AdminErrorFallback,
  },

  // ── Guard factory example ─────────────────────────────────────────────────
  {
    path: "/editor",
    component: () => <h2>Editor Panel</h2>,
    guards: [isAuthenticated, hasRole("editor")],
    redirectTo: "/403",
    guardFallback: GuardLoader,
  },
]);

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return <Router routes={routes} errorFallback={GlobalErrorFallback} />;
}
