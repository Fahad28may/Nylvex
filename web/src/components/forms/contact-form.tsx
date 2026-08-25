"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitContactForm, type ContactFormState } from "@/app/contact/actions";
import { Field, TextInput, TextArea, Select } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

const initialState: ContactFormState = { status: "idle" };

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (state.status === "success") {
      trackEvent("contact_submitted");
    }
  }, [state.status]);

  const handleStart = () => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    trackEvent("contact_started");
  };

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-border bg-surface p-8">
        <p className="text-base text-foreground">
          {state.message ?? "Thanks — your message has been received."}
        </p>
      </div>
    );
  }

  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} onFocus={handleStart} className="flex flex-col gap-6">
      {/* Honeypot field: hidden from real users, bots tend to fill every input */}
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {state.status === "error" && state.message ? (
        <p className="text-sm text-red-400">{state.message}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
      </div>

      <Field label="Company" htmlFor="companyName">
        <TextInput id="companyName" name="companyName" autoComplete="organization" maxLength={200} />
      </Field>

      <Field label="What are you trying to build?" htmlFor="project" required error={errors.project}>
        <TextArea id="project" name="project" maxLength={5000} required />
      </Field>

      <Field
        label="What problem are you trying to solve?"
        htmlFor="problem"
        required
        error={errors.problem}
      >
        <TextArea id="problem" name="problem" maxLength={5000} required />
      </Field>

      <Field label="Existing system (if any)" htmlFor="existingSystem">
        <TextInput id="existingSystem" name="existingSystem" maxLength={1000} />
      </Field>

      <Field label="Required integrations" htmlFor="integrations">
        <TextInput id="integrations" name="integrations" maxLength={1000} />
      </Field>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field label="Budget range" htmlFor="budget">
          <Select id="budget" name="budget" defaultValue="">
            <option value="" disabled>
              Select a range
            </option>
            <option value="< $5k">Under $5k</option>
            <option value="$5k - $15k">$5k – $15k</option>
            <option value="$15k - $50k">$15k – $50k</option>
            <option value="$50k+">$50k+</option>
            <option value="Not sure yet">Not sure yet</option>
          </Select>
        </Field>

        <Field label="Timeline" htmlFor="timeline">
          <Select id="timeline" name="timeline" defaultValue="">
            <option value="" disabled>
              Select a timeline
            </option>
            <option value="ASAP">ASAP</option>
            <option value="1-3 months">1–3 months</option>
            <option value="3-6 months">3–6 months</option>
            <option value="Exploratory">Just exploring</option>
          </Select>
        </Field>
      </div>

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Sending..." : "Send inquiry"}
      </Button>
    </form>
  );
}
