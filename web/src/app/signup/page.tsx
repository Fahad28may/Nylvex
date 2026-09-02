import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SignupForm } from "@/components/forms/signup-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a Nylvex account.",
};

export default async function SignupPage() {
  const session = await auth();
  if (session) redirect("/");

  return (
    <Container className="flex flex-col gap-10 py-14 md:py-20">
      <div className="flex flex-col gap-4">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
          Sign up
        </span>
        <h1 className="max-w-2xl text-3xl font-medium tracking-tight text-foreground md:text-4xl">
          Create your account
        </h1>
        <p className="max-w-xl text-base text-muted-strong md:text-lg">
          Create an account to get started with Nylvex.
        </p>
      </div>

      <div className="max-w-md">
        <SignupForm />
      </div>
    </Container>
  );
}
