import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { LoginForm } from "@/components/forms/login-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Nylvex account.",
};

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <Container className="flex flex-col gap-10 py-14 md:py-20">
      <div className="flex flex-col gap-4">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
          Log in
        </span>
        <h1 className="max-w-2xl text-3xl font-medium tracking-tight text-foreground md:text-4xl">
          Welcome back
        </h1>
      </div>

      <div className="max-w-md">
        <LoginForm />
      </div>
    </Container>
  );
}
