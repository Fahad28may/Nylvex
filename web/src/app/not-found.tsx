import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-start gap-6 py-32 md:py-40">
      <span className="font-mono text-sm text-accent">404</span>
      <h1 className="max-w-xl text-3xl font-medium tracking-tight text-foreground md:text-4xl">
        This page doesn&apos;t exist.
      </h1>
      <p className="max-w-md text-base text-muted-strong">
        The page you&apos;re looking for may have moved or never existed.
      </p>
      <Button href="/">Back to home</Button>
    </Container>
  );
}
