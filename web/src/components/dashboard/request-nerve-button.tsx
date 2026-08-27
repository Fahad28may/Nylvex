"use client";

import { useActionState } from "react";
import { requestNerve } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import type { NerveProvisioningResult } from "@/lib/nerve/provisioning";

const initialState: NerveProvisioningResult = { status: "requested" };

export function RequestNerveButton({ label = "Request Nerve" }: { label?: string }) {
  const [state, formAction, isPending] = useActionState<NerveProvisioningResult>(
    async () => requestNerve(),
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Requesting..." : label}
      </Button>
      {state.status === "failed" && state.message ? (
        <span className="max-w-48 text-right text-xs text-red-400">{state.message}</span>
      ) : null}
    </form>
  );
}
