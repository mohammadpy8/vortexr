/**
 * vortexr — complete example
 *
 * Week 1: scroll restoration, useNavigate, useMatch, Error Boundary
 * Week 2: <Outlet /> nested layouts
 * Week 3: loader, useLoaderData, useNavigation
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
  useLoaderData,
  useNavigation,
  routerStore,
  defineRouteConfig,
  type RouteConfig,
  type GuardFn,
  type LoaderFn,
  type VortexrErrorFallback,
} from "vortexr";

routerStore.setScrollBehavior("top");

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

async function fakeDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((r) => setTimeout(() => r(data), ms));
}

const isAuthenticated: GuardFn = () => Boolean(localStorage.getItem("token"));

const isAdmin: GuardFn = async () => {
  await fakeDelay(null, 150);
  return localStorage.getItem("role") === "admin";
};

const usersLoader: LoaderFn<User[]> = async () => {
  return fakeDelay(fakeUsers);
};

const userDetailLoader: LoaderFn<User> = async ({ params }) => {
  const user = fakeUsers.find((u) => u.id === params.id);
  if (!user) throw new Error(`User #${params.id} not found`);
  return fakeDelay(user);
};

const postsLoader: LoaderFn<Post[]> = async () => {
  return fakeDelay(fakePosts, 300);
};

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

/**
 * Uses useNavigation() to show a top loading bar during
 * any navigation or loader execution.
 */
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
        animation: "loadingSlide 1s ease-in-out infinite",
      }}
    />
  );
}

function RootLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { state } = useNavigation();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Global loading bar */}
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
        <NavLink to="/users" activeClassName="nav-active">
          Users
        </NavLink>
        <NavLink to="/posts" activeClassName="nav-active">
          Posts
        </NavLink>
        <NavLink to="/admin" activeClassName="nav-active">
          Admin
        </NavLink>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
          {state === "loading" && <span style={{ color: "#999", fontSize: "0.85rem" }}>Loading...</span>}
          <button onClick={() => navigate(-1)}>← Back</button>
          <button
            onClick={() => {
              localStorage.setItem("token", "abc");
              localStorage.setItem("role", "admin");
              navigate("/users");
            }}
          >
            Login
          </button>
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

function DashboardLayout({ children }: { children: ReactNode }) {
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
        <br />
        <NavLink to="/admin/users" activeClassName="active">
          Users
        </NavLink>
      </aside>
      <section>
        <Outlet />
        {children}
      </section>
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const match = useMatch("/");

  return (
    <div>
      <h1>🌀 vortexr</h1>
      <p>useMatch("/"): {match ? "✅ matched" : "❌"}</p>
      <p>
        Week 3 features: <code>loader</code>, <code>useLoaderData</code>, <code>useNavigation</code>
      </p>
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
        <button onClick={() => navigate("/users")}>Users (with loader)</button>
        <button onClick={() => navigate("/posts")}>Posts (with loader)</button>
        <button onClick={() => navigate("/crash")}>Crash (error boundary)</button>
      </div>
    </div>
  );
}

/**
 * UsersPage — loader fetches all users before render.
 * useLoaderData<User[]>() is available instantly, no useEffect needed.
 */
function UsersPage() {
  const users = useLoaderData<User[]>();

  return (
    <div>
      <h2>Users</h2>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        Data loaded before render via <code>loader</code>
      </p>
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
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ padding: "0.5rem" }}>
                <Link to={`/users/${user.id}`}>#{user.id}</Link>
              </td>
              <td style={{ padding: "0.5rem" }}>{user.name}</td>
              <td style={{ padding: "0.5rem" }}>{user.email}</td>
              <td style={{ padding: "0.5rem" }}>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * UserDetailPage — loader fetches a single user by :id param.
 * If not found, loader throws → ErrorBoundary catches it.
 */
function UserDetailPage() {
  const user = useLoaderData<User>();
  const navigate = useNavigate();
  const match = useMatch("/users/:id");

  return (
    <div>
      <h2>User: {user.name}</h2>
      <p>
        <strong>ID:</strong> {user.id}
      </p>
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

/**
 * PostsPage — demonstrates loader with search params.
 */
function PostsPage() {
  const posts = useLoaderData<Post[]>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get("page") ?? "1";

  return (
    <div>
      <h2>Posts — Page {page}</h2>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>Data pre-fetched via loader</p>
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

function AdminOverviewPage() {
  return <h2>🔐 Admin Overview</h2>;
}

function AdminSettingsPage() {
  return <h2>⚙️ Admin Settings</h2>;
}

function AdminUsersPage() {
  return <h2>👥 Admin → Users</h2>;
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
          navigate("/users");
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
      <Link to="/">← Go Home</Link>
    </div>
  );
}

function BuggyPage(): ReactNode {
  throw new Error("💣 This component always crashes — ErrorBoundary saves the day!");
}

function GuardLoader() {
  return <div style={{ padding: "2rem", textAlign: "center", color: "#999" }}>Checking permissions...</div>;
}

const routes = defineRouteConfig([
  { path: "/", component: HomePage, layout: RootLayout },
  { path: "/login", component: LoginPage },
  { path: "/403", component: ForbiddenPage },
  { path: "/crash", component: BuggyPage, layout: RootLayout },

  {
    path: "/users",
    component: UsersPage,
    layout: RootLayout,
    guard: isAuthenticated,
    redirectTo: "/login",
    loader: usersLoader, // ← fetches all users before render
  },
  {
    path: "/users/:id",
    component: UserDetailPage,
    layout: RootLayout,
    guard: isAuthenticated,
    redirectTo: "/login",
    loader: userDetailLoader, // ← fetches user by :id, throws if not found
  },

  {
    path: "/posts",
    component: PostsPage,
    layout: RootLayout,
    loader: postsLoader,
  },

  {
    path: "/admin",
    component: AdminOverviewPage,
    layout: RootLayout,
    guards: [isAuthenticated, isAdmin],
    redirectTo: "/login",
    guardFallback: GuardLoader,
    children: [
      {
        path: "/settings",
        component: AdminSettingsPage,
        layout: DashboardLayout,
      },
      {
        path: "/users",
        component: AdminUsersPage,
        layout: DashboardLayout,
      },
    ],
  },
]);

export default function App() {
  return <Router routes={routes} errorFallback={GlobalErrorFallback} />;
}
