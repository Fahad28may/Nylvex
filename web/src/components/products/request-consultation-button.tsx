"use client";

import { Button } from "@/components/ui/button";
import { writeChatHandoff } from "@/lib/chat-handoff";

export function RequestConsultationButton({
  productName,
  variant = "primary",
  className,
}: {
  productName: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  return (
    <Button
      href="/contact"
      variant={variant}
      className={className}
      onClick={() => writeChatHandoff(`I'm interested in ${productName}.`)}
    >
      Request a Consultation
    </Button>
  );
}
