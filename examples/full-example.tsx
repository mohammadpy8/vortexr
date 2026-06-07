/**
 * Full example: nested routes, layouts, dynamic params, hooks
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
} from "vortexr";


function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav style={{ display: "flex", gap: "1rem", padding: "1rem", borderBottom: "1px solid #eee" }}>
        <NavLink to="/" activeClassName="font-bold">Home</NavLink>
        <NavLink to="/dashboard" activeClassName="font-bold">Dashboard</NavLink>
        <NavLink to="/users" activeClassName="font-bold">Users</NavLink>
      </nav>
      <main style={{ padding: "2rem" }}>{children}</main>
    </div>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "2rem" }}>
      <aside>
        <Link to="/dashboard">Overview</Link>
        <Link to="/dashboard/settings">Settings</Link>
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
      <h1>Welcome to Vortexr</h1>
      <button onClick={() => push("/dashboard")}>Go to Dashboard</button>
    </div>
  );
}

function DashboardPage() {
  return <h2>Dashboard Overview</h2>;
}

function SettingsPage() {
  return <h2>Settings</h2>;
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
      <button onClick={() => setSearchParams({ page: String(Number(page) + 1) })}>
        Next Page
      </button>
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
  const pathname = usePathname();

  return (
    <div>
      <h2>User #{id}</h2>
      <p>Current path: {pathname}</p>
      <Link to="/users">← Back to Users</Link>
    </div>
  );
}

function ProtectedPage() {
  const isLoggedIn = false; 
  if (!isLoggedIn) return <Navigate to="/login" />;
  return <h2>Super Secret Page</h2>;
}

function LoginPage() {
  return <h2>Login Page</h2>;
}


const routes: RouteConfig[] = [
  {
    path: "/",
    component: HomePage,
    layout: RootLayout,
  },
  {
    path: "/dashboard",
    component: DashboardPage,
    layout: RootLayout,
    children: [
      {
        path: "/settings",
        component: SettingsPage,
        layout: DashboardLayout,
      },
      {
        path: "/profile",
        component: ProfilePage,
        layout: DashboardLayout,
      },
    ],
  },
  {
    path: "/users",
    component: UsersPage,
    layout: RootLayout,
  },
  {
    path: "/users/:id",
    component: UserDetailPage,
    layout: RootLayout,
  },
  {
    path: "/secret",
    component: ProtectedPage,
  },
  {
    path: "/login",
    component: LoginPage,
  },
];


export default function App() {
  return <Router routes={routes} />;
}
