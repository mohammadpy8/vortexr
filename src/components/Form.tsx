import { type FormEvent, type FormHTMLAttributes, type ReactNode } from "react";
import { usePathname } from "../hooks/usePathname";

type FormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & {
  children: ReactNode;
};

/**
 * A form component that submits to the current route's `action` function.
 * No page reload. Action result is accessible via useActionData().
 *
 * @example
 * // Route definition:
 * {
 *   path: "/login",
 *   component: LoginPage,
 *   action: async ({ formData }) => {
 *     const email    = formData.get("email");
 *     const password = formData.get("password");
 *     const ok = await login(email, password);
 *     if (!ok) return { error: "Invalid credentials" };
 *     return "/dashboard"; // redirect
 *   }
 * }
 *
 * // Inside LoginPage:
 * function LoginPage() {
 *   const { data, state } = useActionData<{ error?: string }>();
 *   return (
 *     <Form>
 *       <input name="email" type="email" />
 *       <input name="password" type="password" />
 *       {data?.error && <p>{data.error}</p>}
 *       <button disabled={state === "submitting"}>Login</button>
 *     </Form>
 *   );
 * }
 */
export function Form({ children, ...rest }: FormProps) {
  const pathname = usePathname();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const key = `vortexr:action:${pathname}`;
    window.dispatchEvent(new CustomEvent(key, { detail: { formData } }));
  }

  return (
    <form onSubmit={handleSubmit} {...rest}>
      {children}
    </form>
  );
}
