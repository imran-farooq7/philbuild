// components/auth/login-form.tsx
"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login } from "@/actions/auth";
import { toast } from "sonner";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});

  useEffect(() => {
    if (state?.error) {
      toast(state.error);
    }
  }, [state?.error]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FieldGroup>
        <Field data-invalid={!!state?.fieldErrors?.email}>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <Input
            id="login-email"
            type="email"
            placeholder="email@example.com"
            autoComplete="email"
            aria-invalid={!!state?.fieldErrors?.email}
            name="email"
            required
          />
          <FieldError
            errors={
              state?.fieldErrors?.email
                ? [{ message: state.fieldErrors.email }]
                : []
            }
          />
        </Field>
        <Field data-invalid={!!state?.fieldErrors?.password}>
          <FieldLabel htmlFor="login-password">Password</FieldLabel>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!state?.fieldErrors?.password}
            name="password"
            required
          />
          <FieldError
            errors={
              state?.fieldErrors?.password
                ? [{ message: state.fieldErrors.password }]
                : []
            }
          />
        </Field>
        {state?.error ? (
          <Field data-invalid>
            <FieldError errors={[{ message: state.error }]} />
          </Field>
        ) : null}
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
