"use client";

import { Button } from "@/components/ui/button";
import { writeChatHandoff } from "@/lib/chat-handoff";

export function RequestConsultationButton({
  productName,
  className,
}: {
  productName: string;
  className?: string;
}) {
  return (
    <Button
      href="/contact"
      className={className}
      onClick={() => writeChatHandoff(`I'm interested in ${productName}.`)}
    >
      Request a Consultation
    </Button>
  );
}
