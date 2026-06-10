<div align="center">

<br />

# 🌀 vortexr

**Zero-dependency React router.**
Nested layouts. Dynamic routes. Guard chains. Loaders. Error Boundary. Typed params. ~3kb gzipped.

<br />

[![npm version](https://img.shields.io/npm/v/vortexr?color=0070f3&style=flat-square)](https://npmjs.com/package/vortexr)
[![bundle size](https://img.shields.io/bundlephobia/minzip/vortexr?color=00c853&label=gzip&style=flat-square)](https://bundlephobia.com/package/vortexr)
[![license](https://img.shields.io/npm/l/vortexr?color=8b5cf6&style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square)](https://typescriptlang.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/mohammadpy8/vortexr/pulls)
[![zero deps](https://img.shields.io/badge/dependencies-0-orange?style=flat-square)](#)
[![tests](https://img.shields.io/badge/tests-44%20passing-brightgreen?style=flat-square)](#testing)

<br />

```bash
npm install vortexr
```

<br />

</div>

---

## Why vortexr?

Most routing libraries are massive. They carry years of legacy decisions, layers of abstraction, and APIs that require reading 40 pages of docs before writing a single route.

**vortexr is different.**

It's built on two things you already have: **React** and the **History API**. Nothing more.

```
react-router-dom   →  53kb gzipped   →  3 peer deps
@tanstack/router   →  43kb gzipped   →  4 peer deps
vortexr            →  ~3kb gzipped   →  0 deps       ✓
```

---

## Features

|    | Feature                   | Details                                                          |
|----|---------------------------|------------------------------------------------------------------|
| 🧭 | **Nested layouts**        | Stack layouts like Next.js App Router — without the framework    |
| 🔀 | **Dynamic segments**      | `/users/:id/posts/:postId` just works                            |
| 🧩 | **Children routes**       | Inherit parent path prefix and layout chain automatically        |
| 🛡️ | **Route guards**          | Sync or async. Single guard or full middleware chain             |
| 🔁 | **Guard inheritance**     | Child routes automatically inherit parent guards                 |
| ⏳ | **Async guard fallback**  | Show a loader while async guards are resolving                   |
| 🚪 | **`<Outlet />`**          | True nested rendering inside layouts — react-router style        |
| 📦 | **Route loaders**         | Fetch data before a page renders. Access via `useLoaderData()`   |
| ⚡ | **Navigation state**      | `useNavigation()` — `"idle"` or `"loading"` for global spinners  |
| 💥 | **Error Boundary**        | Per-route or global. Custom fallback UI with reset support       |
| 🗂️ | **Route meta**            | Set `document.title` and description automatically per route     |
| 🌍 | **Basename support**      | Deploy on a subdirectory with zero extra config                  |
| 📜 | **Scroll restoration**    | `"top"`, `"restore"`, or `"none"` — your choice                  |
| 🔷 | **Full TypeScript**       | Typed params, typed guards, typed loaders, typed context         |
| 🪶 | **Tiny**                  | ~3kb gzipped. Zero runtime dependencies                          |
| 🌐 | **External URL aware**    | `<Link>` degrades gracefully for `http://` URLs                  |
| 🎯 | **NavLink**               | Active class/style applied automatically on path match           |
| ✅ | **44 passing tests**      | `matcher`, `guards`, `flatten`, `store` — all covered            |

---

## Installation

```bash
npm install vortexr
# or
yarn add vortexr
# or
pnpm add vortexr
```

> **Requires React 18+**

---

## Quick Start

```tsx
import { Router, Link, defineRouteConfig } from "vortexr";

function HomePage()  { return <h1>Home</h1>;  }
function AboutPage() { return <h1>About</h1>; }

const routes = defineRouteConfig([
  { path: "/",      component: HomePage  },
  { path: "/about", component: AboutPage },
]);

export default function App() {
  return <Router routes={routes} />;
}
```

No providers. No context setup. No boilerplate. Just routes.

---

## Layouts

Assign a layout to any route. Child routes **inherit** parent layouts and stack their own on top.

```tsx
function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <main>{children}</main>
    </>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr" }}>
      <aside>
        <Link to="/dashboard/settings">Settings</Link>
        <Link to="/dashboard/profile">Profile</Link>
      </aside>
      <section>{children}</section>
    </div>
  );
}

const routes = defineRouteConfig([
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
        layout: DashboardLayout, // stacks on top of RootLayout
      },
    ],
  },
]);
```

The render chain goes **outside → in**:

```
RootLayout
  └── DashboardLayout
        └── SettingsPage
```

---

## `<Outlet />`

Use `<Outlet />` inside any layout to render the matched child route. Works exactly like react-router.

```tsx
function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr" }}>
      <aside>
        <Link to="/dashboard/settings">Settings</Link>
        <Link to="/dashboard/profile">Profile</Link>
      </aside>
      <section>
        <Outlet /> {/* ← matched child renders here */}
      </section>
    </div>
  );
}
```

`<Outlet />` and `{children}` are equivalent — use whichever feels natural.

---

## Dynamic Routes

```tsx
// Route: /users/:id/posts/:postId
function PostPage() {
  const { id, postId } = useParams<{ id: string; postId: string }>();
  return <p>User {id} — Post {postId}</p>;
}

const routes = defineRouteConfig([
  { path: "/users/:id/posts/:postId", component: PostPage },
]);
```

Supported patterns:

| Pattern        | Example URL            | Extracted Params           |
|----------------|------------------------|----------------------------|
| `/users/:id`   | `/users/42`            | `{ id: "42" }`             |
| `/posts/:slug` | `/posts/hello-world`   | `{ slug: "hello-world" }`  |
| `/a/:x/b/:y`   | `/a/1/b/2`             | `{ x: "1", y: "2" }`       |
| `/docs/*`      | `/docs/anything/here`  | —                          |

---

## Route Loaders

Loaders run **before** a route renders. The data is available instantly via `useLoaderData()` — no `useEffect`, no loading state in your component.

```tsx
// Define the loader
const userLoader: LoaderFn<User> = async ({ params }) => {
  const res = await fetch(`/api/users/${params.id}`);
  if (!res.ok) throw new Error("User not found"); // ErrorBoundary catches this
  return res.json();
};

// Attach it to the route
const routes = defineRouteConfig([
  {
    path: "/users/:id",
    component: UserPage,
    loader: userLoader,
  },
]);

// Use the data inside the component
function UserPage() {
  const user = useLoaderData<User>();
  return <h1>{user.name}</h1>;
}
```

The loader receives `{ params, searchParams }`:

```ts
const postsLoader: LoaderFn = async ({ params, searchParams }) => {
  const page = searchParams.get("page") ?? "1";
  return fetch(`/api/posts?page=${page}`).then(r => r.json());
};
```

---

## Navigation State

Use `useNavigation()` to show a global loading indicator while a navigation or loader is running.

```tsx
function LoadingBar() {
  const { state } = useNavigation();
  if (state === "idle") return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0,
      height: "3px",
      background: "linear-gradient(90deg, #0070f3, #7928ca)",
    }} />
  );
}

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LoadingBar />
      <nav>...</nav>
      <main>{children}</main>
    </>
  );
}
```

| State       | Meaning                                    |
|-------------|--------------------------------------------|
| `"idle"`    | Nothing in progress                        |
| `"loading"` | Navigation or loader is running            |

---

## Route Guards

Guards run **before** a route renders. They can be sync or async and decide whether to allow or deny navigation.

A guard returns:
- `true` → allow, continue to the next guard
- `false` → deny, redirect to `redirectTo`
- `"/some/path"` → deny, redirect to that specific path

### Single Guard

```tsx
const isAuthenticated = () => Boolean(localStorage.getItem("token"));

const routes = defineRouteConfig([
  {
    path: "/dashboard",
    component: DashboardPage,
    guard: isAuthenticated,
    redirectTo: "/login",
  },
]);
```

### Async Guard

```tsx
const isAdmin = async () => {
  const user = await fetchCurrentUser();
  if (user.role === "admin") return true;
  return "/403"; // redirect directly from the guard
};

const routes = defineRouteConfig([
  {
    path: "/admin",
    component: AdminPage,
    guard: isAdmin,
    guardFallback: LoadingSpinner, // shown while async guard resolves
  },
]);
```

### Guard Chain (middleware)

All guards must pass. Stops at the first failure.

```tsx
const routes = defineRouteConfig([
  {
    path: "/admin",
    component: AdminPage,
    guards: [isAuthenticated, isAdmin], // short-circuits on first failure
    redirectTo: "/login",
    guardFallback: LoadingSpinner,
  },
]);
```

### Guard Factory

```tsx
const hasRole = (required: string): GuardFn => async () => {
  const user = await fetchCurrentUser();
  return user.role === required;
};

const hasPermission = (permission: string): GuardFn => async () => {
  const user = await fetchCurrentUser();
  return user.permissions.includes(permission);
};

const routes = defineRouteConfig([
  {
    path: "/editor",
    component: EditorPage,
    guards: [isAuthenticated, hasRole("editor"), hasPermission("write")],
    redirectTo: "/403",
  },
]);
```

### Guard Inheritance

Child routes **automatically inherit** parent guards.

```tsx
const routes = defineRouteConfig([
  {
    path: "/dashboard",
    component: DashboardPage,
    guard: isAuthenticated, // defined once on parent
    redirectTo: "/login",
    children: [
      {
        path: "/settings",
        component: SettingsPage,
        // isAuthenticated inherited automatically
      },
      {
        path: "/admin",
        component: AdminSection,
        guard: isAdmin, // runs AFTER the inherited isAuthenticated
      },
    ],
  },
]);
```

Guard execution order for `/dashboard/admin`:

```
isAuthenticated  →  isAdmin  →  render AdminSection
```

---

## Error Boundary

vortexr wraps every route in an error boundary automatically. If a component throws, the fallback UI is shown instead of crashing the whole app.

### Global fallback

```tsx
<Router
  routes={routes}
  errorFallback={({ error, reset }) => (
    <div>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )}
/>
```

### Per-route fallback

```tsx
const routes = defineRouteConfig([
  {
    path: "/admin",
    component: AdminPage,
    errorFallback: ({ error, reset }) => (
      <div>
        <h2>Admin panel crashed</h2>
        <button onClick={reset}>Retry</button>
      </div>
    ),
  },
]);
```

The per-route `errorFallback` takes priority over the Router-level one. If neither is set, a built-in error screen with a stack trace is shown.

---

## Route Meta

Set `document.title` and meta description automatically when a route becomes active.

```tsx
const routes = defineRouteConfig([
  {
    path: "/dashboard",
    component: DashboardPage,
    meta: {
      title: "Dashboard — MyApp",
      description: "Manage your account",
    },
  },
]);
```

Access it inside a component:

```tsx
const meta = useRouteMeta();
// → { title: "Dashboard — MyApp", description: "Manage your account" }
```

You can also add any extra fields:

```tsx
meta: { title: "Admin", requiresAuth: true, icon: "🔐" }
```

---

## Scroll Restoration

Configure how vortexr handles scroll position on navigation.

```ts
import { routerStore } from "vortexr";

routerStore.setScrollBehavior("top");     // always scroll to top (default)
routerStore.setScrollBehavior("restore"); // restore previous scroll on back/forward
routerStore.setScrollBehavior("none");    // do nothing
```

---

## Basename

For apps deployed on a subdirectory.

```tsx
// via Router prop
<Router routes={routes} basename="/my-app" />

// or globally
routerStore.setBasename("/my-app");
```

With `basename="/my-app"`:
- `push("/dashboard")` → navigates to `/my-app/dashboard`
- `usePathname()` → returns `/dashboard` (without the basename)

---

## API Reference

### Components

#### `<Router>`

```tsx
<Router
  routes={routes}
  notFound={My404Page}
  errorFallback={({ error, reset }) => <div>...</div>}
  basename="/my-app"
/>
```

| Prop            | Type                    | Required | Description                                      |
|-----------------|-------------------------|----------|--------------------------------------------------|
| `routes`        | `RouteConfig[]`         | ✅       | Array of route definitions                       |
| `notFound`      | `VortexrComponent`      | ❌       | Custom 404 page. Defaults to built-in screen     |
| `errorFallback` | `VortexrErrorFallback`  | ❌       | Global error fallback. Overridable per-route     |
| `basename`      | `string`                | ❌       | Base path for subdirectory deployments           |

---

#### `<Link>`

```tsx
<Link to="/dashboard">Dashboard</Link>
<Link to="/settings" replace>Settings</Link>
<Link to="https://github.com" target="_blank">GitHub</Link>
```

| Prop      | Type                   | Default | Description                               |
|-----------|------------------------|---------|-------------------------------------------|
| `to`      | `string`               | —       | Target path or URL                        |
| `replace` | `boolean`              | `false` | Use `replaceState` instead of `pushState` |
| `...rest` | `AnchorHTMLAttributes` | —       | All standard `<a>` props are forwarded    |

---

#### `<NavLink>`

```tsx
<NavLink to="/dashboard" activeClassName="font-bold text-blue-500">
  Dashboard
</NavLink>

<NavLink to="/docs" activeStyle={{ color: "blue" }} exact={false}>
  Docs
</NavLink>
```

| Prop              | Type            | Default    | Description                      |
|-------------------|-----------------|------------|----------------------------------|
| `to`              | `string`        | —          | Target path                      |
| `activeClassName` | `string`        | `"active"` | Class applied when active        |
| `activeStyle`     | `CSSProperties` | —          | Inline style applied when active |
| `exact`           | `boolean`       | `true`     | Match full path or just prefix   |

---

#### `<Navigate>`

```tsx
if (!isLoggedIn) return <Navigate to="/login" />;
if (isAdmin)     return <Navigate to="/admin" replace />;
```

| Prop      | Type      | Default | Description                               |
|-----------|-----------|---------|-------------------------------------------|
| `to`      | `string`  | —       | Redirect target path                      |
| `replace` | `boolean` | `false` | Use `replaceState` instead of `pushState` |

---

### Hooks

#### `useRouter`

```tsx
const { push, replace, back, forward } = useRouter();

push("/dashboard");
replace("/login");
back();
forward();
```

| Return    | Type                     | Description                   |
|-----------|--------------------------|-------------------------------|
| `push`    | `(path: string) => void` | Navigate to a new path        |
| `replace` | `(path: string) => void` | Replace current history entry |
| `back`    | `() => void`             | `history.back()`              |
| `forward` | `() => void`             | `history.forward()`           |

---

#### `useNavigate`

react-router style alias for `useRouter`. Supports numeric delta.

```tsx
const navigate = useNavigate();

navigate("/dashboard");
navigate("/settings", { replace: true });
navigate(-1);  // go back
navigate(1);   // go forward
```

| Signature                                            | Description                     |
|------------------------------------------------------|---------------------------------|
| `navigate(path: string, options?: { replace })` | Navigate to path                |
| `navigate(-1)`                                       | Go back one step                |
| `navigate(1)`                                        | Go forward one step             |

---

#### `usePathname`

```tsx
const pathname = usePathname();
// → "/users/42"
```

---

#### `useParams`

```tsx
// Route: /users/:id/posts/:postId
const { id, postId } = useParams<{ id: string; postId: string }>();
```

---

#### `useSearchParams`

```tsx
const [params, setParams] = useSearchParams();

params.get("page");           // → "2"
setParams({ page: "3" });     // → ?page=3
```

---

#### `useMatch`

Tests whether a pattern matches the current path.

```tsx
const match = useMatch("/users/:id");
if (match) {
  console.log(match.params.id); // → "42"
}
```

| Return                              | Description               |
|-------------------------------------|---------------------------|
| `{ params: Record<string,string> }` | Pattern matched           |
| `null`                              | Pattern did not match     |

---

#### `useLoaderData`

Returns the data from the current route's `loader`. Fully typed via generics.

```tsx
const user = useLoaderData<User>();
```

---

#### `useNavigation`

```tsx
const { state } = useNavigation();
// "idle" | "loading"
```

---

#### `useRouteMeta`

```tsx
const meta = useRouteMeta();
// → { title: "Dashboard", description: "..." }
```

---

### Route Config

```ts
type RouteConfig = {
  /** Path pattern. Supports :param segments and * wildcard. */
  path: string;

  /** Page component rendered when this route matches. */
  component: VortexrComponent;

  /** Optional layout wrapping the page. Must accept a `children` prop. */
  layout?: VortexrLayout;

  /** Nested child routes. Inherit parent path, layouts, and guards. */
  children?: RouteConfig[];

  /** Single guard function. */
  guard?: GuardFn;

  /** Guard middleware chain. All must pass. Runs after `guard` if both are set. */
  guards?: GuardFn[];

  /** Where to redirect if any guard fails. Defaults to "/" */
  redirectTo?: string;

  /** Component shown while async guards are resolving. */
  guardFallback?: VortexrComponent;

  /** Custom error fallback. Overrides the Router-level errorFallback. */
  errorFallback?: VortexrErrorFallback;

  /**
   * Loader function. Runs before the route renders.
   * Result is accessible via useLoaderData().
   */
  loader?: LoaderFn;

  /**
   * Route metadata. `title` sets document.title automatically.
   * Accessible inside the component via useRouteMeta().
   */
  meta?: RouteMeta;
};
```

---

### Guard Types

```ts
type GuardFn = () => boolean | string | Promise<boolean | string>;

type GuardResult =
  | { allowed: true }
  | { allowed: false; redirectTo: string };
```

---

### Loader Types

```ts
type LoaderArgs = {
  params: Record<string, string>;
  searchParams: URLSearchParams;
};

type LoaderFn<T = unknown> = (args: LoaderArgs) => T | Promise<T>;
```

---

### Advanced: Direct Store Access

```ts
import { routerStore } from "vortexr";

routerStore.push("/dashboard");
routerStore.replace("/login");
routerStore.back();
routerStore.forward();

routerStore.setBasename("/my-app");
routerStore.setScrollBehavior("restore");

const path = routerStore.getPath();         // current pathname (without basename)
const base = routerStore.getBasename();     // current basename

const unsubscribe = routerStore.subscribe((path) => {
  console.log("navigated to:", path);
});

unsubscribe();
```

| Method                | Signature                          | Description                            |
|-----------------------|------------------------------------|----------------------------------------|
| `push`                | `(path: string) => void`           | Push new history entry                 |
| `replace`             | `(path: string) => void`           | Replace current entry                  |
| `back`                | `() => void`                       | Go back                                |
| `forward`             | `() => void`                       | Go forward                             |
| `getPath`             | `() => string`                     | Get current pathname (no basename)     |
| `getBasename`         | `() => string`                     | Get current basename                   |
| `setBasename`         | `(base: string) => void`           | Set subdirectory basename              |
| `setScrollBehavior`   | `(b: ScrollBehavior) => void`      | Set scroll behavior on navigation      |
| `subscribe`           | `(fn: Listener) => () => void`     | Subscribe to path changes              |

---

### Advanced: `runGuards`

Run a guard chain manually — outside of the router.

```ts
import { runGuards } from "vortexr";

const result = await runGuards([isAuthenticated, isAdmin], "/login");

if (result.allowed) {
  console.log("access granted");
} else {
  console.log("redirect to:", result.redirectTo);
}
```

---

## Testing

vortexr ships with **44 unit tests** covering all core utilities.

```bash
npm install vitest happy-dom --save-dev
npm test
```

```
✓ matcher.test.ts   — static, dynamic, wildcard, nested, edge cases  (16 tests)
✓ guards.test.ts    — allow, deny, short-circuit, async, redirect     (12 tests)
✓ flatten.test.ts   — paths, layouts, guards, meta inheritance        (14 tests)
✓ store.test.ts     — basename, scroll behavior                        (4 tests)
```

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
  },
});
```

---

## How It Works

```
URL change (pushState / popstate)
        │
        ▼
   routerStore                ← pub/sub wrapper around History API
        │
        ▼
  usePathname()               ← useState + subscribe → triggers re-render
        │
        ▼
   <Router />                 ← flattenRoutes → matchPath → pick winner
        │
        ▼
  <GuardedRoute />            ← runs guard chain (sync or async)
        │
     ┌──┴──┐
   deny   allow
     │      │
  redirect  ▼
        <LoadedRoute />       ← runs loader, sets navState "loading" → "idle"
              │
              ▼
         layout chain         ← reduceRight + OutletContext: Layout[0] → Layout[1] → Page
              │
              ▼
        RouterContext         ← pathname, params, push, replace, basename
        NavigationContext     ← state: "idle" | "loading"
        LoaderProvider        ← data from loader
        RouteMetaContext      ← meta object, syncs document.title
              │
              ▼
         ErrorBoundary        ← per-route or global fallback
              │
              ▼
          Page renders        ← useParams, useLoaderData, useNavigation, useRouteMeta...
```

---

## Recommended Project Structure

```
src/
├── router/
│   └── routes.tsx             ← all route definitions in one place
│
├── guards/
│   ├── isAuthenticated.ts     ← () => Boolean(token)
│   ├── isAdmin.ts             ← async role check
│   └── hasRole.ts             ← guard factory
│
├── loaders/
│   ├── usersLoader.ts         ← async ({ params }) => fetch(...)
│   └── userDetailLoader.ts
│
├── layouts/
│   ├── RootLayout.tsx         ← global nav, footer, loading bar
│   ├── DashboardLayout.tsx    ← sidebar, breadcrumbs
│   └── AuthLayout.tsx         ← centered card for login/signup
│
├── pages/
│   ├── home/
│   │   └── page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   └── users/
│       ├── page.tsx
│       └── [id]/
│           └── page.tsx
│
└── App.tsx
```

---

## Roadmap

- [x] `<Outlet />` — nested rendering inside layouts
- [x] Route-level `loader` — fetch data before render
- [x] `useNavigation` — global loading state
- [x] Error Boundary — per-route and global
- [x] Route `meta` — `document.title` sync
- [x] Scroll restoration — `"top"` / `"restore"` / `"none"`
- [x] `basename` support — subdirectory deployments
- [x] 44 unit tests
- [ ] `React.lazy` + `<Suspense>` — code-split routes
- [ ] Hash routing mode — `#/path` for static hosts

---

## Contributing

PRs are welcome. Open an issue first for bigger changes.

```bash
git clone https://github.com/mohammadpy8/vortexr
cd vortexr
npm install
npm run dev
```

---

## License

MIT © [Mohammad](https://github.com/mohammadpy8)

---

<div align="center">
  <br />
  <sub>Built from scratch. No magic. No dependencies. Just React and the History API.</sub>
  <br /><br />
  <sub>If vortexr saved you from installing another bloated router — leave a ⭐</sub>
  <br />
</div>