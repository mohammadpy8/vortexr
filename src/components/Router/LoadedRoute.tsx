import { useEffect, useState, type ReactNode } from "react";
import { LoaderProvider } from "../../core/loader";
import { ActionProvider } from "../../core/action";
import { getCached, setCached, isFresh } from "../../utils/prefetch";
import { routerStore } from "../../core/store";
import type { ActionArgs, ActionState, FlatRoute, LoaderArgs, NavigationState } from "../../types";

type Props = {
  route: FlatRoute;
  params: Record<string, string>;
  children: ReactNode;
  onStateChange: (state: NavigationState) => void;
};

export function LoadedRoute({ route, params, children, onStateChange }: Props) {
  const cached = route.loader && route.staleTime ? getCached(route.path) : undefined;

  const [loaderData, setLoaderData] = useState<unknown>(cached);
  const [ready, setReady] = useState(!route.loader || cached !== undefined);
  const [actionData, setActionData] = useState<unknown>(undefined);
  const [actionState, setActionState] = useState<ActionState>("idle");

  useEffect(() => {
    if (!route.loader) {
      setReady(true);
      setLoaderData(undefined);
      return;
    }

    if (route.staleTime && isFresh(route.path)) {
      setLoaderData(getCached(route.path));
      setReady(true);
      return;
    }

    let cancelled = false;
    onStateChange("loading");

    const args: LoaderArgs = {
      params,
      searchParams: new URLSearchParams(window.location.search),
    };

    Promise.resolve(route.loader(args))
      .then((data) => {
        if (cancelled) return;
        if (route.staleTime) setCached(route.path, data, route.staleTime);
        setLoaderData(data);
        setReady(true);
        onStateChange("idle");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        onStateChange("idle");
        throw err;
      });

    return () => {
      cancelled = true;
    };
  }, [route.path]);

  useEffect(() => {
    if (!route.action) return;

    const handler = async (e: Event) => {
      const { formData } = (e as CustomEvent<{ formData: FormData }>).detail;

      setActionState("submitting");

      const args: ActionArgs = {
        formData,
        params,
        searchParams: new URLSearchParams(window.location.search),
      };

      try {
        const result = await route.action!(args);

        if (typeof result === "string") {
          // Action returned a redirect path
          setActionState("idle");
          routerStore.push(result);
        } else {
          setActionData(result);
          setActionState("idle");
        }
      } catch (err) {
        setActionState("idle");
        throw err;
      }
    };

    const key = `vortexr:action:${route.path}`;
    window.addEventListener(key, handler as EventListener);
    return () => window.removeEventListener(key, handler as EventListener);
  }, [route.path]);

  if (!ready) return null;

  return (
    <ActionProvider data={actionData} state={actionState}>
      <LoaderProvider data={loaderData}>{children}</LoaderProvider>
    </ActionProvider>
  );
}
