"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type LoginFormState } from "@/app/login/actions";
import { Field, TextInput } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

const initialState: LoginFormState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.status === "error" && state.message ? (
        <p className="text-sm text-red-400">{state.message}</p>
      ) : null}

      <Field label="Email" htmlFor="email" required>
        <TextInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
        />
      </Field>

      <Field label="Password" htmlFor="password" required>
        <PasswordInput id="password" name="password" autoComplete="current-password" required />
      </Field>

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Logging in..." : "Log in"}
      </Button>

      <p className="text-sm text-muted-strong">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-foreground underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </form>
  );
}
