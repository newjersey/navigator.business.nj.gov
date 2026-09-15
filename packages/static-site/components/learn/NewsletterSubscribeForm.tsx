"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { LocalizedLink } from "@/components/landing/LocalizedLink";
import type { ContentLink } from "@/domain/content/messageTypes";
import { validateEmail } from "./validateEmail";

export interface NewsletterSubscribeMessages {
  readonly subscribeHeading: string;
  readonly subscribeDescription: string;
  readonly subscribeConsentPrefix: string;
  readonly subscribePrivacyPolicyLink: ContentLink;
  readonly subscribeEmailLabel: string;
  readonly subscribeButton: string;
  readonly subscribeInvalidEmail: string;
  readonly subscribeSuccess: string;
  readonly subscribeError: string;
}

interface Props {
  readonly messages: NewsletterSubscribeMessages;
}

type SubmitStatus = "success" | "error";

const NewsletterSubscribeForm = ({ messages }: Props) => {
  const [email, setEmail] = useState("");
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [status, setStatus] = useState<SubmitStatus | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validateEmail(email)) {
      setInvalidEmail(true);
      setStatus(undefined);
      return;
    }

    setInvalidEmail(false);
    setIsSubmitting(true);
    try {
      // biome-ignore lint/style/noProcessEnv: build-time value inlined by Next.js, consistent with next.config.ts.
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/api/external/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { success: boolean };
      setStatus(result.success ? "success" : "error");
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="funding-subscribe-col border-1px border-base-lighter padding-3 radius-lg margin-y-3">
      <h2 className="margin-top-0 margin-bottom-1 font-sans-md text-bold">
        {messages.subscribeHeading}
      </h2>
      <p className="margin-top-0">
        {messages.subscribeDescription} {messages.subscribeConsentPrefix}{" "}
        <LocalizedLink link={messages.subscribePrivacyPolicyLink} />.
      </p>
      <form onSubmit={handleSubmit} aria-label={messages.subscribeHeading}>
        <div className={invalidEmail ? "usa-form-group--error" : undefined}>
          <label
            className={`usa-label text-bold ${invalidEmail ? "usa-label--error" : ""}`}
            htmlFor="newsletter-subscribe-email"
          >
            {messages.subscribeEmailLabel}
          </label>
          <div className="display-flex flex-align-start">
            <input
              id="newsletter-subscribe-email"
              className={`usa-input flex-auto ${invalidEmail ? "usa-input--error" : ""}`}
              type="text"
              inputMode="email"
              autoComplete="email"
              value={email}
              aria-describedby={invalidEmail ? "newsletter-subscribe-email-error" : undefined}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button type="submit" className="usa-button margin-left-1" disabled={isSubmitting}>
              {messages.subscribeButton}
            </button>
          </div>
          {invalidEmail && (
            <div className="nj-error-message-container">
              <Icon iconName="error" />
              <span
                className="usa-error-message"
                role="alert"
                id="newsletter-subscribe-email-error"
              >
                {messages.subscribeInvalidEmail}
              </span>
            </div>
          )}
        </div>
      </form>
      {status === "success" && (
        <p role="status" className="margin-bottom-0">
          {messages.subscribeSuccess}
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="usa-error-message">
          {messages.subscribeError}
        </p>
      )}
    </section>
  );
};

export default NewsletterSubscribeForm;
