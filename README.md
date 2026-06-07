<div align="center">

# 🌀 vortexr

**Zero-dependency React router.**  
Nested layouts. Dynamic routes. Typed params. 3kb gzipped.

<br />

[![npm version](https://img.shields.io/npm/v/vortexr?color=0070f3&style=flat-square)](https://npmjs.com/package/vortexr)
[![bundle size](https://img.shields.io/bundlephobia/minzip/vortexr?color=00c853&label=gzip&style=flat-square)](https://bundlephobia.com/package/vortexr)
[![license](https://img.shields.io/npm/l/vortexr?color=8b5cf6&style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square)](https://typescriptlang.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/mohammadpy8/vortexr/pulls)
[![zero deps](https://img.shields.io/badge/dependencies-0-orange?style=flat-square)](#)

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

| | Feature | Details |
|---|---|---|
| 🧭 | **Nested layouts** | Stack layouts like Next.js App Router — without the framework |
| 🔀 | **Dynamic segments** | `/users/:id/posts/:postId` — just works |
| 🧩 | **Children routes** | Inherit parent path prefix and layout chain automatically |
| 🔷 | **Full TypeScript** | Typed params, typed context, typed everything |
| 🪶 | **Tiny** | ~3kb gzipped. Zero runtime dependencies |
| ⚡ | **Fast** | No virtual DOM diffing on navigation. Direct pub/sub store |
| 🌐 | **External URL aware** | `<Link>` degrades gracefully for `http://` URLs |
| 🎯 | **NavLink** | Active class/style applied automatically on match |

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
import { Router, Link, type RouteConfig } from "vortexr";

function HomePage() {
  return <h1>Home</h1>;
}

function AboutPage() {
  return <h1>About</h1>;
}

const routes: RouteConfig[] = [
  { path: "/",      component: HomePage },
  { path: "/about", component: AboutPage },
];

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
        layout: DashboardLayout,  // stacks on top of RootLayout
      },
    ],
  },
];
```

The render chain goes **outside → in**:

```
RootLayout
  └── DashboardLayout
        └── SettingsPage
```

---

## Dynamic Routes

```tsx
// Route: /users/:id/posts/:postId
function PostPage() {
  const { id, postId } = useParams<{ id: string; postId: string }>();
  return <p>User {id} — Post {postId}</p>;
}

const routes: RouteConfig[] = [
  { path: "/users/:id/posts/:postId", component: PostPage },
];
```

Supported patterns:

| Pattern | Example URL | Params |
|---|---|---|
| `/users/:id` | `/users/42` | `{ id: "42" }` |
| `/posts/:slug` | `/posts/hello-world` | `{ slug: "hello-world" }` |
| `/a/:x/b/:y` | `/a/1/b/2` | `{ x: "1", y: "2" }` |
| `/docs/*` | `/docs/anything/here` | — |

---

## API Reference

### Components

#### `<Router>`

The root component. Match the current URL against your route config and render the result.

```tsx
<Router routes={routes} notFound={MyCustom404} />
```

| Prop | Type | Required | Description |
|---|---|---|---|
| `routes` | `RouteConfig[]` | ✅ | Array of route definitions |
| `notFound` | `ComponentType` | ❌ | Custom 404 page. Defaults to built-in screen |

---

#### `<Link>`

Client-side navigation. Zero page reload. Degrades to `<a>` for external URLs.

```tsx
<Link to="/dashboard">Dashboard</Link>
<Link to="/settings" replace>Settings</Link>
<Link to="https://github.com" target="_blank">GitHub</Link>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `to` | `string` | — | Target path or URL |
| `replace` | `boolean` | `false` | Use `replaceState` instead of `pushState` |
| `...rest` | `AnchorHTMLAttributes` | — | All standard `<a>` props are forwarded |

---

#### `<NavLink>`

Like `<Link>`, but automatically marks itself active when the path matches.

```tsx
<NavLink to="/dashboard" activeClassName="text-blue-500 font-bold">
  Dashboard
</NavLink>

<NavLink to="/settings" activeStyle={{ color: "blue" }} exact={false}>
  Settings
</NavLink>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `to` | `string` | — | Target path |
| `activeClassName` | `string` | `"active"` | Class applied when active |
| `activeStyle` | `CSSProperties` | — | Inline style applied when active |
| `exact` | `boolean` | `true` | Match full path or prefix |
| `...rest` | `LinkProps` | — | All `<Link>` props are forwarded |

---

#### `<Navigate>`

Redirect when rendered. Great for auth guards and conditional redirects.

```tsx
function ProtectedPage() {
  if (!isLoggedIn) return <Navigate to="/login" />;
  return <h1>Secret stuff</h1>;
}
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `to` | `string` | — | Redirect target |
| `replace` | `boolean` | `false` | Use `replaceState` instead of `pushState` |

---

### Hooks

#### `useRouter`

Returns navigation methods. Stable references — safe to use in event handlers.

```tsx
const { push, replace, back, forward } = useRouter();

push("/dashboard");     // add new history entry
replace("/login");      // replace current entry
back();                 // go back one step
forward();              // go forward one step
```

| Return | Type | Description |
|---|---|---|
| `push` | `(path: string) => void` | Navigate to a new path |
| `replace` | `(path: string) => void` | Replace current history entry |
| `back` | `() => void` | `history.back()` |
| `forward` | `() => void` | `history.forward()` |

---

#### `usePathname`

Returns the current pathname. Re-renders the component on every navigation.

```tsx
const pathname = usePathname();
// → "/users/42"
```

| Return | Type | Description |
|---|---|---|
| `pathname` | `string` | Current `window.location.pathname` |

---

#### `useParams`

Returns the dynamic segments extracted from the matched route. Fully typed with generics.

```tsx
// Route: /users/:id/posts/:postId
const { id, postId } = useParams<{ id: string; postId: string }>();
```

| Signature | Description |
|---|---|
| `useParams<T>()` | Returns `T` (defaults to `Record<string, string>`) |

---

#### `useSearchParams`

Read and write URL query params. Reactive — updates on every navigation.

```tsx
const [params, setParams] = useSearchParams();

const page = params.get("page");       // → "2"
const q    = params.get("q");          // → "react"

setParams({ page: "3", q: "hooks" }); // → ?page=3&q=hooks
```

| Return | Type | Description |
|---|---|---|
| `[0]` | `URLSearchParams` | Current search params (read) |
| `[1]` | `(params: Record<string, string>) => void` | Set new params (write) |

---

### Route Config

```ts
type RouteConfig = {
  /** Path pattern. Supports :param segments and * wildcard. */
  path: string;

  /** Page component rendered when this route matches. */
  component: ComponentType;

  /**
   * Optional layout wrapping the page.
   * Must accept a `children` prop.
   */
  layout?: ComponentType<{ children: ReactNode }>;

  /**
   * Nested child routes.
   * They inherit the parent path prefix and layout chain.
   */
  children?: RouteConfig[];
};
```

---

### Advanced: Direct Store Access

For navigation outside React components — auth interceptors, global error handlers, anything.

```ts
import { routerStore } from "vortexr";

// Navigate
routerStore.push("/dashboard");
routerStore.replace("/login");

// Listen to path changes
const unsubscribe = routerStore.subscribe((path) => {
  console.log("navigated to:", path);
});

// Stop listening
unsubscribe();
```

| Method | Signature | Description |
|---|---|---|
| `push` | `(path: string) => void` | Push new history entry |
| `replace` | `(path: string) => void` | Replace current entry |
| `back` | `() => void` | Go back |
| `forward` | `() => void` | Go forward |
| `getPath` | `() => string` | Get current pathname |
| `subscribe` | `(fn: Listener) => () => void` | Subscribe to path changes |

---

## Recommended Project Structure

```
src/
├── router/
│   └── routes.tsx          ← all routes defined here
│
├── layouts/
│   ├── RootLayout.tsx       ← global nav, footer
│   ├── DashboardLayout.tsx  ← sidebar, sub-nav
│   └── AuthLayout.tsx       ← centered card for login/signup
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

## How It Works

```
URL change (pushState / popstate)
        │
        ▼
   routerStore          ← pub/sub, wraps History API
        │
        ▼
  usePathname()         ← useState + subscribe
        │
        ▼
   <Router />           ← flattenRoutes → matchPath → pick winner
        │
        ▼
  layout chain          ← reduceRight: RootLayout → DashboardLayout → Page
        │
        ▼
  RouterContext         ← provides { pathname, params, push, replace, ... }
        │
        ▼
   Page renders         ← useParams(), useRouter(), useSearchParams()
```

No virtual DOM overhead on navigation. No re-rendering the whole tree. Just a single `setState` in `usePathname` that triggers only the components that care.

---

## Roadmap

- [ ] `<Outlet />` — true nested rendering without config
- [ ] Route-level `loader` — fetch data before the page renders
- [ ] Route guards / middleware — intercept navigation
- [ ] `React.lazy` + `<Suspense>` — code-split routes automatically
- [ ] Scroll restoration — restore scroll position on back/forward
- [ ] Hash routing mode — `#/path` support for static hosts

---

## Contributing

PRs are welcome. Open an issue first for big changes.

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