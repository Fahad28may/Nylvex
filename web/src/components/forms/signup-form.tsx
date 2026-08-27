"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type SignupFormState } from "@/app/signup/actions";
import { Field, TextInput } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

const initialState: SignupFormState = { status: "idle" };

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.status === "error" && state.message ? (
        <p className="text-sm text-red-400">{state.message}</p>
      ) : null}

      <Field label="Name" htmlFor="name" required error={errors.name}>
        <TextInput id="name" name="name" autoComplete="name" maxLength={200} required />
      </Field>

      <Field label="Email" htmlFor="email" required error={errors.email}>
        <TextInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
        />
      </Field>

      <Field label="Password" htmlFor="password" required error={errors.password}>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={200}
          required
        />
      </Field>

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-sm text-muted-strong">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </form>
  );
}
