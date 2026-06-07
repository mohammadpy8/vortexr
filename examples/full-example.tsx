/**
 * vortexr — full example
 * Demonstrates: layouts, nested routes, dynamic params,
 * single guards, guard chains, async guards, guardFallback
 */
import React from "react";
import {
  Router,
  Link,
  NavLink,
  Navigate,
  useRouter,
  useParams,
  usePathname,
  useSearchParams,
  type RouteConfig,
  type GuardFn,
} from "vortexr";

const auth = {
  isLoggedIn: () => Boolean(localStorage.getItem("token")),
  getRole: async (): Promise<string> => {
    await new Promise((r) => setTimeout(r, 300)); // simulate API call
    return localStorage.getItem("role") ?? "guest";
  },
};

/**
 * Simple sync guard — checks if the user is logged in.
 * Returns false → redirect to `redirectTo` on the route.
 */
const isAuthenticated: GuardFn = () => auth.isLoggedIn();

/**
 * Async guard — fetches role from API and checks for "admin".
 * Returns a redirect path string directly.
 */
const isAdmin: GuardFn = async () => {
  const role = await auth.getRole();
  if (role === "admin") return true;
  return "/403"; // redirect to /403 instead of the default redirectTo
};

/**
 * Guard factory — returns a guard that checks a specific role.
 */
const hasRole =
  (required: string): GuardFn =>
  async () => {
    const role = await auth.getRole();
    return role === required;
  };

function GuardLoader() {
  return <div style={{ padding: "2rem", textAlign: "center", color: "#999" }}>Checking permissions...</div>;
}

function RootLayout({ children }: { children: React.ReactNode }) {
  const { push } = useRouter();
  return (
    <div>
      <nav style={{ display: "flex", gap: "1.5rem", padding: "1rem 2rem", borderBottom: "1px solid #eee" }}>
        <NavLink to="/" activeClassName="font-bold">
          Home
        </NavLink>
        <NavLink to="/dashboard" activeClassName="font-bold">
          Dashboard
        </NavLink>
        <NavLink to="/users" activeClassName="font-bold">
          Users
        </NavLink>
        <NavLink to="/admin" activeClassName="font-bold">
          Admin
        </NavLink>
        <button onClick={() => push("/login")} style={{ marginLeft: "auto" }}>
          Login
        </button>
      </nav>
      <main style={{ padding: "2rem" }}>{children}</main>
    </div>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "2rem" }}>
      <aside style={{ borderRight: "1px solid #eee", paddingRight: "2rem" }}>
        <Link to="/dashboard">Overview</Link>
        <br />
        <Link to="/dashboard/settings">Settings</Link>
        <br />
        <Link to="/dashboard/profile">Profile</Link>
      </aside>
      <section>{children}</section>
    </div>
  );
}

function HomePage() {
  const { push } = useRouter();
  return (
    <div>
      <h1>Welcome to vortexr</h1>
      <button onClick={() => push("/dashboard")}>Go to Dashboard</button>
    </div>
  );
}

function DashboardPage() {
  return <h2>Dashboard Overview</h2>;
}

function SettingsPage() {
  const pathname = usePathname();
  return (
    <div>
      <h2>Settings</h2>
      <p>Current path: {pathname}</p>
    </div>
  );
}

function ProfilePage() {
  return <h2>Profile</h2>;
}

function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get("page") ?? "1";

  return (
    <div>
      <h2>Users — Page {page}</h2>
      <button onClick={() => setSearchParams({ page: String(Number(page) + 1) })}>Next Page →</button>
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
  return (
    <div>
      <h2>User #{id}</h2>
      <Link to="/users">← Back to Users</Link>
    </div>
  );
}

function AdminPage() {
  return <h2>🔐 Admin Panel — you made it in</h2>;
}

function LoginPage() {
  const { push } = useRouter();
  return (
    <div>
      <h2>Login</h2>
      <button
        onClick={() => {
          localStorage.setItem("token", "abc");
          localStorage.setItem("role", "admin");
          push("/dashboard");
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

const routes: RouteConfig[] = [
  {
    path: "/",
    component: HomePage,
    layout: RootLayout,
  },
  {
    path: "/login",
    component: LoginPage,
  },
  {
    path: "/403",
    component: ForbiddenPage,
  },

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

  {
    path: "/dashboard",
    component: DashboardPage,
    layout: RootLayout,
    guard: isAuthenticated, // parent guard — inherited by children
    redirectTo: "/login",
    guardFallback: GuardLoader,
    children: [
      {
        path: "/settings",
        component: SettingsPage,
        layout: DashboardLayout,
        // inherits isAuthenticated from parent automatically
      },
      {
        path: "/profile",
        component: ProfilePage,
        layout: DashboardLayout,
      },
    ],
  },
  {
    path: "/admin",
    component: AdminPage,
    layout: RootLayout,
    guards: [isAuthenticated, isAdmin], // chain: all must pass
    redirectTo: "/login",
    guardFallback: GuardLoader,
  },
  {
    path: "/editor",
    component: () => <h2>Editor Panel</h2>,
    guards: [isAuthenticated, hasRole("editor")],
    redirectTo: "/403",
    guardFallback: GuardLoader,
  },
];

export default function App() {
  return <Router routes={routes} />;
}
