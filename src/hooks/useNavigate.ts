import { useCallback } from "react";
import { useRouter } from "./useRouter";

/**
 * react-router style navigation hook.
 * Supports numeric delta for back/forward.
 *
 * @example
 * const navigate = useNavigate();
 * navigate("/dashboard");
 * navigate("/settings", { replace: true });
 * navigate(-1); // go back
 * navigate(1);  // go forward
 */
export function useNavigate() {
  const { push, replace, back, forward } = useRouter();

  return useCallback(
    (to: string | number, options?: { replace?: boolean }) => {
      if (typeof to === "number") {
        if (to === -1) return back();
        if (to === 1) return forward();
        return;
      }
      options?.replace ? replace(to) : push(to);
    },
    [push, replace, back, forward],
  );
}
