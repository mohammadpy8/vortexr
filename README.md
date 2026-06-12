<div align="center">

<br />

# 🌀 vortexr

**Zero-dependency React router.**
Nested layouts · Dynamic routes · Guard chains · Loaders & Actions · Lazy loading · Prefetch · Blockers · Hash routing · Typed routes · DevTools

<br />

[![npm version](https://img.shields.io/npm/v/vortexr?color=0070f3&style=flat-square)](https://npmjs.com/package/vortexr)
[![bundle size](https://img.shields.io/bundlephobia/minzip/vortexr?color=00c853&label=gzip&style=flat-square)](https://bundlephobia.com/package/vortexr)
[![license](https://img.shields.io/npm/l/vortexr?color=8b5cf6&style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square)](https://typescriptlang.org)
[![zero deps](https://img.shields.io/badge/dependencies-0-orange?style=flat-square)](#)
[![tests](https://img.shields.io/badge/tests-81%20passing-brightgreen?style=flat-square)](#testing)

<br />

```bash
npm install vortexr
```

<br />

</div>

---

## Why vortexr?

Most routing libraries are massive. They carry years of legacy decisions, layers of abstraction, and APIs that require reading 40 pages of docs before writing a single route.

**vortexr is different.** It's built on two things you already have: **React** and the **History API**. Nothing more.

```
react-router-dom   →  53kb gzipped   →  3 peer deps
@tanstack/router   →  43kb gzipped   →  4 peer deps
vortexr            →  ~4kb gzipped   →  0 deps       ✓
```

Despite the size, vortexr ships with features some frameworks don't have: **prefetching**, **route-level caching**, **navigation blockers**, **hash routing**, and **fully typed navigation**.

---

## Features

|    | Feature                     | Details                                                          |
|----|------------------------------|--------------------------------------------------------------------|
| 🧭 | **Nested layouts**           | Stack layouts like Next.js App Router — without the framework    |
| 🚪 | **`<Outlet />`**              | True nested rendering — react-router style                       |
| 🔀 | **Dynamic segments**          | `/users/:id/posts/:postId` just works                            |
| 🛡️ | **Route guards**              | Sync or async. Single guard or full middleware chain             |
| 🔁 | **Guard inheritance**         | Child routes automatically inherit parent guards                 |
| 📦 | **Loaders**                   | Fetch data before render. Access via `useLoaderData()`           |
| 📝 | **Actions + `<Form>`**        | Handle form submissions without page reload (remix-style)        |
| ⚡ | **`useNavigation`**           | Global `"idle"` / `"loading"` state                              |
| 💥 | **Error Boundary**            | Per-route or global, with reset support                          |
| 🗂️ | **Route meta**                | Auto `document.title` + description sync                          |
| 🌍 | **Basename**                  | Deploy on a subdirectory with zero config                        |
| #️⃣ | **Hash routing**              | `/#/path` mode for static hosts (GitHub Pages, etc.)              |
| 🚦 | **`useBlocker`**              | Warn before leaving with unsaved changes                          |
| 🪝 | **`beforeEach`/`afterEach`**  | Global navigation hooks — analytics, auth, redirects              |
| ⚡ | **Lazy routes**               | `lazyRoute()` + built-in `<Suspense>`                            |
| 🔗 | **Prefetch**                  | `<Link prefetch="hover" \| "render">` warms the loader cache     |
| ⏱️ | **`staleTime` cache**          | Skip re-fetching loader data within a time window                |
| 🧬 | **Typed routes**               | `createRouter()` — type-checked `push("/users/:id", { id })`     |
| 🔧 | **DevTools**                   | Floating panel: active route, guards, cache, history             |
| 📜 | **Scroll restoration**         | `"top"`, `"restore"`, or `"none"`                                 |
| 🔷 | **Full TypeScript**             | Everything typed — params, guards, loaders, actions, meta        |
| 🪶 | **Tiny**                        | ~4kb gzipped, zero runtime dependencies                          |
| ✅ | **81 passing tests**           | Every utility and core module covered                            |

---

## Installation

```bash
npm install vortexr
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

No providers. No context setup. Just routes.

---

## Layouts & `<Outlet />`

```tsx
function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <main>
        <Outlet /> {/* renders the matched child route */}
      </main>
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
      <section><Outlet /></section>
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
      { path: "/settings", component: SettingsPage, layout: DashboardLayout },
      { path: "/profile",  component: ProfilePage,  layout: DashboardLayout },
    ],
  },
]);
```

Render chain (outside → in):
```
RootLayout → DashboardLayout → SettingsPage
```

`<Outlet />` and `{children}` are equivalent — use whichever feels natural.

---

## Dynamic Routes

```tsx
function PostPage() {
  const { id, postId } = useParams<{ id: string; postId: string }>();
  return <p>User {id} — Post {postId}</p>;
}

const routes = defineRouteConfig([
  { path: "/users/:id/posts/:postId", component: PostPage },
]);
```

| Pattern        | Example URL            | Params                      |
|----------------|--------------------------|--------------------------------|
| `/users/:id`   | `/users/42`              | `{ id: "42" }`                  |
| `/posts/:slug` | `/posts/hello-world`     | `{ slug: "hello-world" }`        |
| `/a/:x/b/:y`   | `/a/1/b/2`               | `{ x: "1", y: "2" }`             |
| `/docs/*`      | `/docs/anything/here`    | —                                |

---

## Route Guards

```tsx
const isAuthenticated = () => Boolean(localStorage.getItem("token"));

const isAdmin = async () => {
  const user = await fetchCurrentUser();
  return user.role === "admin" ? true : "/403"; // redirect to /403 if not admin
};

const routes = defineRouteConfig([
  {
    path: "/admin",
    component: AdminPage,
    guards: [isAuthenticated, isAdmin], // all must pass, short-circuits on failure
    redirectTo: "/login",
    guardFallback: LoadingSpinner,       // shown while async guards resolve
  },
]);
```

Child routes **automatically inherit** parent guards:

```tsx
{
  path: "/dashboard",
  guard: isAuthenticated,  // inherited by all children
  children: [
    { path: "/settings", component: SettingsPage },                    // inherits isAuthenticated
    { path: "/admin",    component: AdminSection, guard: isAdmin },    // runs AFTER isAuthenticated
  ],
}
```

---

## Loaders

Data fetches **before** the page renders. No `useEffect`, no loading state in your component.

```tsx
const userLoader: LoaderFn<User> = async ({ params }) => {
  const res = await fetch(`/api/users/${params.id}`);
  if (!res.ok) throw new Error("User not found"); // caught by ErrorBoundary
  return res.json();
};

const routes = defineRouteConfig([
  { path: "/users/:id", component: UserPage, loader: userLoader },
]);

function UserPage() {
  const user = useLoaderData<User>();
  return <h1>{user.name}</h1>;
}
```

The loader receives `{ params, searchParams }`.

### Caching with `staleTime`

```tsx
{
  path: "/posts",
  component: PostsPage,
  loader: postsLoader,
  staleTime: 30_000, // cache for 30s — re-navigating skips the loader
}
```

---

## Actions + `<Form>`

Handle form submissions remix-style — no page reload, no manual `fetch` wiring.

```tsx
const loginAction: ActionFn<{ error?: string }> = async ({ formData }) => {
  const email    = formData.get("email");
  const password = formData.get("password");

  const ok = await login(email, password);
  if (!ok) return { error: "Invalid credentials" };
  return "/dashboard"; // returning a string = redirect
};

const routes = defineRouteConfig([
  { path: "/login", component: LoginPage, action: loginAction },
]);

function LoginPage() {
  const { data, state } = useActionData<{ error?: string }>();

  return (
    <Form>
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button disabled={state === "submitting"}>
        {state === "submitting" ? "Signing in..." : "Sign in"}
      </button>
      {data?.error && <p>{data.error}</p>}
    </Form>
  );
}
```

---

## Lazy Loading + Prefetch

```tsx
import { lazyRoute } from "vortexr";

const routes = defineRouteConfig([
  {
    path: "/dashboard",
    component: lazyRoute(() => import("./pages/Dashboard")),
  },
]);

// <Router suspenseFallback={...}> controls what shows while loading
<Router routes={routes} suspenseFallback={<Spinner />} />
```

Prefetch a route's loader before the user even navigates:

```tsx
<Link to="/users" prefetch="hover">Users</Link>   {/* warms cache on hover  */}
<Link to="/posts" prefetch="render">Posts</Link>  {/* warms cache on mount */}
```

Combine with `staleTime` — the prefetched data is reused instantly on navigation.

---

## `useBlocker` — unsaved changes guard

```tsx
function SettingsPage() {
  const [dirty, setDirty] = useState(false);

  useBlocker({
    when: dirty,
    message: "You have unsaved changes. Leave anyway?",
  });

  return <input onChange={() => setDirty(true)} />;
}
```

For full control, pass a custom `fn`:

```tsx
useBlocker({
  when: isDirty,
  fn: ({ nextPath }) => {
    if (nextPath === "/save") return true; // always allow this path
    return "Unsaved changes will be lost. Continue?";
  },
});
```

---

## Global Navigation Hooks

```tsx
import { routerStore } from "vortexr";

// Runs before every navigation. Return a string to redirect instead.
routerStore.beforeEach((to, from) => {
  analytics.track("page_view", { path: to });
  if (!isAuthed && to !== "/login") return "/login";
});

// Runs after every navigation.
routerStore.afterEach((to, from) => {
  console.log(`navigated ${from} → ${to}`);
});
```

---

## Hash Routing

For static hosts with no server-side routing (GitHub Pages, S3, etc.):

```tsx
import { routerStore } from "vortexr";

routerStore.setMode("hash");
// /dashboard  →  /#/dashboard
```

Everything else — `<Link>`, `<Router>`, guards, loaders — works exactly the same.

---

## Typed Routes

Type-checked navigation, separate from your `<Router routes={...}>` config:

```tsx
import { createRouter } from "vortexr";

export const appRouter = createRouter([
  "/",
  "/users/:id",
  "/users/:id/posts/:postId",
] as const);

appRouter.push("/users/:id", { id: 42 });
// → navigates to "/users/42"

appRouter.push("/users/:id/posts/:postId", { id: 1, postId: 7 });
// → "/users/1/posts/7"

appRouter.push("/userz");        // ❌ TypeScript error — not in the list
appRouter.push("/users/:id");    // ❌ TypeScript error — missing params
```

---

## DevTools

```tsx
import { VortexrDevTools } from "vortexr";

export default function App() {
  return (
    <>
      <Router routes={routes} />
      <VortexrDevTools />
    </>
  );
}
```

A floating panel (bottom-right, dev-only) showing:
- **Route** — matched pattern, params, active guards, loader/action/cache flags, meta
- **History** — last 20 navigations
- **Cache** — `staleTime` cache status per route (fresh/stale)

Automatically disabled when `NODE_ENV === "production"`.

---

## Route Meta

```tsx
const routes = defineRouteConfig([
  {
    path: "/dashboard",
    component: DashboardPage,
    meta: { title: "Dashboard — MyApp", description: "Manage your account" },
  },
]);
```

`document.title` and `<meta name="description">` are synced automatically. Access via `useRouteMeta()`.

---

## Error Boundaries

```tsx
// Global
<Router
  routes={routes}
  errorFallback={({ error, reset }) => (
    <div>
      <p>{error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  )}
/>

// Per-route — overrides global
{
  path: "/admin",
  component: AdminPage,
  errorFallback: ({ error, reset }) => <AdminCrashScreen error={error} onRetry={reset} />,
}
```

---

## Scroll Restoration & Basename

```tsx
import { routerStore } from "vortexr";

routerStore.setScrollBehavior("top");     // always scroll to top (default)
routerStore.setScrollBehavior("restore"); // restore position on back/forward
routerStore.setScrollBehavior("none");    // do nothing

routerStore.setBasename("/my-app");       // for subdirectory deployments
// or: <Router routes={routes} basename="/my-app" />
```

---

## API Reference

### Components

| Component | Description |
|---|---|
| `<Router routes notFound errorFallback basename suspenseFallback />` | Root router |
| `<Link to replace prefetch />` | Client-side navigation |
| `<NavLink to activeClassName activeStyle exact />` | Link with active state |
| `<Navigate to replace />` | Declarative redirect |
| `<Form>` | Submits to the active route's `action` |
| `<Outlet />` | Renders matched child route |
| `<VortexrDevTools />` | Floating dev panel |

### Hooks

| Hook | Returns |
|---|---|
| `usePathname()` | `string` — current path |
| `useRouter()` | `{ push, replace, back, forward }` |
| `useNavigate()` | `(to: string \| number, opts?) => void` — react-router style |
| `useParams<T>()` | `T` — typed dynamic segments |
| `useSearchParams()` | `[URLSearchParams, setParams]` |
| `useMatch(pattern)` | `{ params } \| null` |
| `useLoaderData<T>()` | `T` — data from route loader |
| `useActionData<T>()` | `{ data: T \| undefined, state }` |
| `useNavigation()` | `{ state: "idle" \| "loading" }` |
| `useRouteMeta()` | `RouteMeta` — active route's meta |
| `useBlocker(options)` | `void` — blocks navigation when `when` is true |

### Utils

| Export | Description |
|---|---|
| `defineRouteConfig(routes)` | Type-safe route config helper |
| `lazyRoute(() => import(...))` | Wraps `React.lazy` for `component` field |
| `createRouter(paths)` | Type-checked `push`/`replace`/`build` |
| `runGuards(guards, redirectTo)` | Manually run a guard chain |
| `clearCache()` | Clears the prefetch/staleTime cache |
| `routerStore` | Low-level store — see below |

### `routerStore`

```ts
routerStore.push(path)
routerStore.replace(path)
routerStore.back()
routerStore.forward()
routerStore.getPath()           // current path (basename-stripped)
routerStore.subscribe(fn)        // → unsubscribe fn

routerStore.setMode("hash" | "history")
routerStore.getMode()

routerStore.setBasename("/my-app")
routerStore.getBasename()

routerStore.setScrollBehavior("top" | "restore" | "none")

routerStore.beforeEach((to, from) => void | string)  // → unsubscribe fn
routerStore.afterEach((to, from) => void)             // → unsubscribe fn
```

---

### `RouteConfig`

```ts
type RouteConfig = {
  path: string;
  component: VortexrComponent;
  layout?: VortexrLayout;
  children?: RouteConfig[];

  guard?: GuardFn;
  guards?: GuardFn[];
  redirectTo?: string;
  guardFallback?: VortexrComponent;

  errorFallback?: VortexrErrorFallback;

  loader?: LoaderFn;
  staleTime?: number;

  action?: ActionFn;

  meta?: RouteMeta;
  prefetch?: "hover" | "render" | "none";
};
```

---

## Testing

```bash
npm install vitest happy-dom --save-dev
npm test
```

```
✓ matcher.test.ts      14 tests — static, dynamic, wildcard, nested
✓ guards.test.ts       11 tests — allow, deny, chains, async
✓ flatten.test.ts      15 tests — path/layout/guard/meta inheritance
✓ prefetch.test.ts     11 tests — cache, staleTime, prefetchLoader
✓ blocker.test.ts       8 tests — register, block, custom messages
✓ beforeEach.test.ts    6 tests — global hooks, redirects
✓ typedRoutes.test.ts   7 tests — build(), push() with params
✓ hashMode.test.ts      5 tests — hash mode navigation
✓ store.test.ts         4 tests — basename, scroll behavior

81 passed
```

---

## How It Works

```
URL change (pushState / hashchange / popstate)
        │
        ▼
   routerStore          ← pub/sub · history or hash mode · basename · blockers · beforeEach/afterEach
        │
        ▼
  usePathname()         ← useState + subscribe
        │
        ▼
   <Router />           ← flattenRoutes → matchPath → pick winning route
        │
        ▼
  <GuardedRoute />      ← guard chain (sync/async) → allow / deny+redirect
        │
        ▼
  <Suspense>            ← supports lazyRoute() components
        │
        ▼
  <LoadedRoute />       ← runs loader (staleTime-aware) + action handler
        │
        ▼
  layout chain          ← Outlet-based: Layout[0] → Layout[1] → Page
        │
        ▼
  Context providers     ← Router · Navigation · Loader · Action · RouteMeta
        │
        ▼
  <ErrorBoundary>        ← per-route or global fallback
        │
        ▼
     Page renders        ← useLoaderData, useActionData, useParams, ...
```

---

## Recommended Project Structure

```
src/
├── router/
│   ├── routes.tsx          ← route definitions
│   └── typedRoutes.ts       ← createRouter([...])
│
├── guards/
│   ├── isAuthenticated.ts
│   └── isAdmin.ts
│
├── loaders/
│   └── usersLoader.ts
│
├── actions/
│   └── loginAction.ts
│
├── layouts/
│   ├── RootLayout.tsx
│   └── DashboardLayout.tsx
│
├── pages/
│   ├── home/page.tsx
│   └── users/
│       ├── page.tsx
│       └── [id]/page.tsx
│
└── App.tsx
```

---

## Roadmap

- [x] Nested layouts, dynamic routes, guard chains
- [x] `<Outlet />`, loaders, `useNavigation`
- [x] Error boundaries, route meta, scroll restoration, basename
- [x] Lazy routes, prefetch, `staleTime` cache
- [x] `useBlocker`
- [x] Actions, `<Form>`, `useActionData`
- [x] `beforeEach`/`afterEach`, hash routing, typed routes, DevTools
- [ ] View Transitions API integration
- [ ] SSR / streaming support

---

## Contributing

```bash
git clone https://github.com/mohammadpy8/vortexr
cd vortexr
npm install
npm run dev
```

PRs welcome — open an issue first for larger changes.

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
