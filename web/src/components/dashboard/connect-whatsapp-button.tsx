"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { connectWhatsapp } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

declare global {
  interface Window {
    FB?: {
      init: (params: { appId: string; version: string }) => void;
      login: (
        callback: (response: { authResponse?: { code?: string } }) => void,
        options: {
          config_id: string;
          response_type: "code";
          override_default_response_type: true;
          extras: { setup: Record<string, never> };
        }
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

const META_SDK_SRC = "https://connect.facebook.net/en_US/sdk.js";
const META_SDK_VERSION = "v21.0";
const GENERIC_FAILURE_MESSAGE = "We couldn't connect WhatsApp right now. Please try again.";

type Status = "idle" | "opening" | "connecting" | "connected" | "failed" | "cancelled";

// Module-level singleton so multiple mounts of this component never
// inject the Meta SDK <script> tag twice or race on window.fbAsyncInit.
let sdkPromise: Promise<void> | null = null;

function loadMetaSdk(appId: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.FB) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB?.init({ appId, version: META_SDK_VERSION });
      resolve();
    };
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = META_SDK_SRC;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("Could not load Meta SDK"));
    };
    document.body.appendChild(script);
  });

  return sdkPromise;
}

/**
 * Launches Meta's WhatsApp Embedded Signup flow and, on success, sends
 * only the short-lived authorization code + Meta's own WABA/phone number
 * identifiers to a Nylvex server action -- this component never sees or
 * handles a Meta access token. See lib/nerve/whatsapp.ts and Nerve's
 * docs/NYLVEX_API.md §8a for what happens after that point.
 *
 * Meta delivers the completion event two ways that can arrive in either
 * order: a `postMessage` (`WA_EMBEDDED_SIGNUP` / `FINISH`, carrying
 * waba_id/phone_number_id) and the `FB.login` callback (carrying the
 * authorization code). Submission only fires once both have arrived.
 */
export function ConnectWhatsappButton({
  initialFailureMessage,
}: {
  /** A prior failure reason from the database, shown before any click in
   * this session -- lets a page reload after a failed attempt still show
   * why, per Phase 10's "failure states must be recoverable" requirement. */
  initialFailureMessage?: string | null;
}) {
  const [status, setStatus] = useState<Status>(initialFailureMessage ? "failed" : "idle");
  const [error, setError] = useState<string | null>(initialFailureMessage ?? null);
  const pendingCodeRef = useRef<string | null>(null);
  const pendingIdsRef = useRef<{ wabaId: string; phoneNumberId: string } | null>(null);
  const submittedRef = useRef(false);

  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const configId = process.env.NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID;

  const trySubmit = useCallback(() => {
    if (submittedRef.current) return;
    const code = pendingCodeRef.current;
    const ids = pendingIdsRef.current;
    if (!code || !ids) return;

    submittedRef.current = true;
    setStatus("connecting");

    connectWhatsapp({ code, wabaId: ids.wabaId, phoneNumberId: ids.phoneNumberId })
      .then((result) => {
        if (result.status === "connected") {
          setStatus("connected");
        } else {
          setStatus("failed");
          setError(result.message ?? GENERIC_FAILURE_MESSAGE);
        }
      })
      .catch(() => {
        setStatus("failed");
        setError(GENERIC_FAILURE_MESSAGE);
      });
  }, []);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.origin.endsWith("facebook.com")) return;

      let data: unknown;
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (!data || typeof data !== "object") return;
      const message = data as Record<string, unknown>;
      if (message.type !== "WA_EMBEDDED_SIGNUP") return;

      if (message.event === "FINISH") {
        const payload = message.data as Record<string, unknown> | undefined;
        const wabaId = payload?.waba_id;
        const phoneNumberId = payload?.phone_number_id;
        if (typeof wabaId === "string" && wabaId && typeof phoneNumberId === "string" && phoneNumberId) {
          pendingIdsRef.current = { wabaId, phoneNumberId };
          trySubmit();
        }
      } else if (message.event === "CANCEL") {
        if (!submittedRef.current) {
          setStatus("cancelled");
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [trySubmit]);

  const handleClick = useCallback(async () => {
    if (!appId || !configId) {
      setStatus("failed");
      setError("WhatsApp connection isn't configured yet.");
      return;
    }

    setError(null);
    submittedRef.current = false;
    pendingCodeRef.current = null;
    pendingIdsRef.current = null;
    setStatus("opening");

    try {
      await loadMetaSdk(appId);
    } catch {
      setStatus("failed");
      setError("Could not load Meta's WhatsApp connection flow. Please try again.");
      return;
    }

    setStatus((current) => (current === "opening" ? "connecting" : current));

    window.FB?.login(
      (response) => {
        const code = response?.authResponse?.code;
        if (typeof code === "string" && code) {
          pendingCodeRef.current = code;
          trySubmit();
        } else if (!submittedRef.current) {
          setStatus("cancelled");
        }
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: { setup: {} },
      }
    );
  }, [appId, configId, trySubmit]);

  if (status === "connected") {
    return <StatusBadge label="WhatsApp connected" tone="positive" />;
  }

  const isBusy = status === "opening" || status === "connecting";

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" size="sm" onClick={handleClick} disabled={isBusy}>
        {status === "connecting" ? "Connecting..." : status === "opening" ? "Opening..." : "Connect WhatsApp"}
      </Button>
      {status === "failed" && error ? (
        <span className="max-w-48 text-right text-xs text-red-400">{error}</span>
      ) : null}
      {status === "cancelled" ? (
        <span className="max-w-48 text-right text-xs text-muted-strong">
          Connection cancelled. You can try again anytime.
        </span>
      ) : null}
    </div>
  );
}
