/**
 * vortexr — complete feature showcase
 *
 * Week 1: scroll restoration, useNavigate, useMatch, Error Boundary
 * Week 2: <Outlet /> nested layouts
 * Week 3: loader, useLoaderData, useNavigation
 * Week 4: basename, route meta / document.title
 * Week 5: lazyRoute, prefetch, staleTime cache
 * Week 6: useBlocker (unsaved changes guard)
 * Week 7: action, <Form>, useActionData
 * Week 8: beforeEach/afterEach, hash router, typed routes, DevTools
 */
import React, { useState, type ReactNode } from "react";
import {
  Router,
  Link,
  NavLink,
  Navigate,
  Form,
  Outlet,
  VortexrDevTools,
  useNavigate,
  useMatch,
  useParams,
  useSearchParams,
  useLoaderData,
  useNavigation,
  useBlocker,
  useActionData,
  routerStore,
  defineRouteConfig,
  lazyRoute,
  createRouter,
  type RouteConfig,
  type GuardFn,
  type LoaderFn,
  type ActionFn,
  type VortexrErrorFallback,
} from "vortexr";

// ─── Global config ────────────────────────────────────────────────────────────

routerStore.setScrollBehavior("top");

// Uncomment to use hash routing (great for GitHub Pages / static hosts):
// routerStore.setMode("hash"); // → /#/dashboard

// Global navigation analytics hook
routerStore.beforeEach((to, from) => {
  console.log(`[analytics] ${from} → ${to}`);
});

// ─── Typed routes — type-safe push/replace ────────────────────────────────────

export const appRouter = createRouter([
  "/",
  "/login",
  "/users",
  "/users/:id",
  "/posts",
  "/settings",
  "/admin",
] as const);

// appRouter.push("/users/:id", { id: 42 }); // ✅ type-checked → "/users/42"

// ─── Mock API ─────────────────────────────────────────────────────────────────

type User = { id: string; name: string; email: string; role: string };
type Post = { id: string; title: string; body: string };

const fakeUsers: User[] = [
  { id: "1", name: "Mohammad", email: "m@dev.io", role: "admin" },
  { id: "2", name: "Sara", email: "s@dev.io", role: "editor" },
  { id: "3", name: "Ali", email: "a@dev.io", role: "viewer" },
];

const fakePosts: Post[] = [
  { id: "1", title: "Hello vortexr", body: "Zero-dep routing is fun." },
  { id: "2", title: "Loaders 101", body: "Fetch before render." },
];

async function delay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((r) => setTimeout(() => r(data), ms));
}

// ─── Guards ───────────────────────────────────────────────────────────────────

const isAuthenticated: GuardFn = () => Boolean(localStorage.getItem("token"));

const isAdmin: GuardFn = async () => {
  await delay(null, 150);
  return localStorage.getItem("role") === "admin";
};

// ─── Loaders ──────────────────────────────────────────────────────────────────

const usersLoader: LoaderFn<User[]> = async () => delay(fakeUsers);

const userDetailLoader: LoaderFn<User> = async ({ params }) => {
  const user = fakeUsers.find((u) => u.id === params.id);
  if (!user) throw new Error(`User #${params.id} not found`);
  return delay(user);
};

const postsLoader: LoaderFn<Post[]> = async () => delay(fakePosts, 300);

// ─── Actions (Week 7) ─────────────────────────────────────────────────────────

const loginAction: ActionFn<{ error?: string }> = async ({ formData }) => {
  await delay(null, 300);
  const email = formData.get("email");
  const password = formData.get("password");

  if (email === "admin@dev.io" && password === "admin") {
    localStorage.setItem("token", "abc");
    localStorage.setItem("role", "admin");
    return "/users"; // redirect on success
  }

  return { error: "Invalid email or password" };
};

const settingsAction: ActionFn<{ success?: boolean }> = async ({ formData }) => {
  await delay(null, 300);
  const name = formData.get("name");
  console.log("Saved settings:", { name });
  return { success: true };
};

// ─── Error Fallbacks ──────────────────────────────────────────────────────────

const GlobalErrorFallback: VortexrErrorFallback = ({ error, reset }) => (
  <div style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}>
    <h2>💥 Something broke</h2>
    <p style={{ color: "#888" }}>{error.message}</p>
    <button onClick={reset} style={{ marginRight: "1rem" }}>
      Try again
    </button>
    <Link to="/">← Home</Link>
  </div>
);

// ─── Loading Bar (useNavigation) ──────────────────────────────────────────────

function LoadingBar() {
  const { state } = useNavigation();
  if (state === "idle") return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: "linear-gradient(90deg, #0070f3, #7928ca)",
        zIndex: 9999,
      }}
    />
  );
}

// ─── Layouts ──────────────────────────────────────────────────────────────────

function RootLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { state } = useNavigation();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <LoadingBar />
      <nav
        style={{
          display: "flex",
          gap: "1.5rem",
          padding: "1rem 2rem",
          borderBottom: "1px solid #eee",
          alignItems: "center",
          opacity: state === "loading" ? 0.6 : 1,
          transition: "opacity 0.2s",
        }}
      >
        <NavLink to="/" activeClassName="nav-active">
          Home
        </NavLink>
        <NavLink to="/users" activeClassName="nav-active" prefetch="hover">
          Users
        </NavLink>
        <NavLink to="/posts" activeClassName="nav-active" prefetch="render">
          Posts
        </NavLink>
        <NavLink to="/settings" activeClassName="nav-active">
          Settings
        </NavLink>
        <NavLink to="/admin" activeClassName="nav-active">
          Admin
        </NavLink>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
          {state === "loading" && <span style={{ color: "#999", fontSize: "0.85rem" }}>Loading...</span>}
          <button onClick={() => navigate(-1)}>← Back</button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </nav>
      <main style={{ padding: "2rem" }}>
        <Outlet />
        {children}
      </main>
    </div>
  );
}

function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "2rem" }}>
      <aside style={{ borderRight: "1px solid #eee", paddingRight: "1.5rem" }}>
        <p style={{ fontWeight: 700, margin: "0 0 1rem" }}>Admin</p>
        <NavLink to="/admin" activeClassName="active" exact>
          Overview
        </NavLink>
        <br />
        <NavLink to="/admin/settings" activeClassName="active">
          Settings
        </NavLink>
      </aside>
      <section>
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
      <h1>🌀 vortexr</h1>
      <p>useMatch("/"): {match ? "✅ matched" : "❌"}</p>
      <p style={{ color: "#888" }}>
        A zero-dependency router with everything you'd expect from a production framework — and a few things you
        wouldn't.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
        <button onClick={() => navigate("/users")}>Users (loader)</button>
        <button onClick={() => navigate("/posts")}>Posts (lazy + prefetch)</button>
        <button onClick={() => navigate("/settings")}>Settings (action + blocker)</button>
        <button onClick={() => navigate("/login")}>Login (action + Form)</button>
        <button onClick={() => navigate("/crash")}>Crash (error boundary)</button>
      </div>
    </div>
  );
}

/** Loader-powered list — data ready before render */
function UsersPage() {
  const users = useLoaderData<User[]>();
  return (
    <div>
      <h2>Users</h2>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>Loaded via route loader</p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #eee", textAlign: "left" }}>
            <th style={{ padding: "0.5rem" }}>ID</th>
            <th style={{ padding: "0.5rem" }}>Name</th>
            <th style={{ padding: "0.5rem" }}>Email</th>
            <th style={{ padding: "0.5rem" }}>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ padding: "0.5rem" }}>
                <Link to={`/users/${u.id}`}>#{u.id}</Link>
              </td>
              <td style={{ padding: "0.5rem" }}>{u.name}</td>
              <td style={{ padding: "0.5rem" }}>{u.email}</td>
              <td style={{ padding: "0.5rem" }}>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserDetailPage() {
  const user = useLoaderData<User>();
  const navigate = useNavigate();
  const match = useMatch("/users/:id");

  return (
    <div>
      <h2>User: {user.name}</h2>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Role:</strong> {user.role}
      </p>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>useMatch params: {JSON.stringify(match?.params)}</p>
      <button onClick={() => navigate(-1)}>← Back</button>
    </div>
  );
}

/** This page is loaded lazily via React.lazy + Suspense */
function PostsPageInner() {
  const posts = useLoaderData<Post[]>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get("page") ?? "1";

  return (
    <div>
      <h2>Posts — Page {page}</h2>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        This page is lazy-loaded. Data is cached for 30s via <code>staleTime</code>.
      </p>
      {posts.map((post) => (
        <div
          key={post.id}
          style={{ padding: "1rem", border: "1px solid #eee", borderRadius: "8px", marginBottom: "1rem" }}
        >
          <h3 style={{ margin: "0 0 0.5rem" }}>{post.title}</h3>
          <p style={{ margin: 0, color: "#666" }}>{post.body}</p>
        </div>
      ))}
      <button onClick={() => setSearchParams({ page: String(Number(page) + 1) })}>Next →</button>
    </div>
  );
}

/**
 * Settings page — demonstrates:
 *   - useBlocker: warns before leaving with unsaved changes
 *   - <Form> + action: submits without page reload
 *   - useActionData: reads the result
 */
function SettingsPage() {
  const [name, setName] = useState("Mohammad");
  const [dirty, setDirty] = useState(false);
  const { data, state } = useActionData<{ success?: boolean }>();

  useBlocker({
    when: dirty,
    message: "You have unsaved changes. Leave without saving?",
  });

  return (
    <div>
      <h2>⚙️ Settings</h2>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        Edit the field below, then try navigating away — vortexr will warn you about unsaved changes (
        <code>useBlocker</code>).
      </p>

      <Form>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Display name
          <br />
          <input
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setDirty(true);
            }}
            style={{ padding: "0.4rem", marginTop: "0.25rem" }}
          />
        </label>

        <button
          type="submit"
          disabled={state === "submitting"}
          onClick={() => setDirty(false)}
          style={{ marginTop: "1rem" }}
        >
          {state === "submitting" ? "Saving..." : "Save"}
        </button>

        {data?.success && <p style={{ color: "#10b981", marginTop: "0.5rem" }}>✅ Saved!</p>}
      </Form>
    </div>
  );
}

/**
 * Login page — demonstrates <Form> + action + redirect on success
 */
function LoginPage() {
  const { data, state } = useActionData<{ error?: string }>();

  return (
    <div>
      <h2>Login</h2>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        Try <code>admin@dev.io</code> / <code>admin</code>
      </p>
      <Form style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "280px" }}>
        <input name="email" type="email" placeholder="Email" style={{ padding: "0.4rem" }} />
        <input name="password" type="password" placeholder="Password" style={{ padding: "0.4rem" }} />
        <button type="submit" disabled={state === "submitting"}>
          {state === "submitting" ? "Signing in..." : "Sign in"}
        </button>
        {data?.error && <p style={{ color: "#ef4444" }}>{data.error}</p>}
      </Form>
    </div>
  );
}

function AdminOverviewPage() {
  return <h2>🔐 Admin Overview</h2>;
}

function AdminSettingsPage() {
  return <h2>⚙️ Admin Settings</h2>;
}

function BuggyPage(): JSX.Element {
  throw new Error("💣 This component always crashes — ErrorBoundary saves the day!");
}

function GuardLoader() {
  return <div style={{ padding: "2rem", textAlign: "center", color: "#999" }}>Checking permissions...</div>;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

const routes = defineRouteConfig([
  // ── Public ────────────────────────────────────────────────────────────────
  {
    path: "/",
    component: HomePage,
    layout: RootLayout,
    meta: { title: "vortexr — Home" },
  },
  {
    path: "/login",
    component: LoginPage,
    layout: RootLayout,
    action: loginAction,
    meta: { title: "Login" },
  },
  {
    path: "/crash",
    component: BuggyPage,
    layout: RootLayout,
  },

  // ── Loader-powered, protected ─────────────────────────────────────────────
  {
    path: "/users",
    component: UsersPage,
    layout: RootLayout,
    guard: isAuthenticated,
    redirectTo: "/login",
    loader: usersLoader,
    meta: { title: "Users" },
  },
  {
    path: "/users/:id",
    component: UserDetailPage,
    layout: RootLayout,
    guard: isAuthenticated,
    redirectTo: "/login",
    loader: userDetailLoader,
  },

  // ── Lazy-loaded + prefetch + staleTime cache ──────────────────────────────
  {
    path: "/posts",
    component: lazyRoute(() => Promise.resolve({ default: PostsPageInner })),
    layout: RootLayout,
    loader: postsLoader,
    staleTime: 30_000, // cache for 30s — re-navigating skips the loader
    prefetch: "render",
    meta: { title: "Posts" },
  },

  // ── Action + blocker (unsaved changes) ────────────────────────────────────
  {
    path: "/settings",
    component: SettingsPage,
    layout: RootLayout,
    action: settingsAction,
    meta: { title: "Settings" },
  },

  // ── Nested admin section ──────────────────────────────────────────────────
  {
    path: "/admin",
    component: AdminOverviewPage,
    layout: RootLayout,
    guards: [isAuthenticated, isAdmin],
    redirectTo: "/login",
    guardFallback: GuardLoader,
    meta: { title: "Admin" },
    children: [
      {
        path: "/settings",
        component: AdminSettingsPage,
        layout: AdminLayout,
      },
    ],
  },
]);

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <>
      <Router
        routes={routes}
        errorFallback={GlobalErrorFallback}
        suspenseFallback={<div style={{ padding: "2rem" }}>Loading page...</div>}
      />
      {/* Floating devtools — auto-hidden in production */}
      <VortexrDevTools />
    </>
  );
}
