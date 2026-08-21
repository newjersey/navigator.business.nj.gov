"use client";

/**
 * Mounts the statewide NJ feedback widget.
 *
 * `@newjersey/feedback-widget` registers a custom element by calling
 * `window.customElements.define` as soon as its bundle evaluates, with no
 * guard for server rendering. Loading it through a dynamic import inside an
 * effect keeps that call off the server and out of the initial bundle. The
 * widget otherwise reads its language from a query parameter, which this app
 * does not use, so the active locale is announced through the widget's
 * documented `changeLanguage` event instead.
 */

import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { toFeedbackWidgetLanguage } from "@/domain/feedback/feedbackWidgetLanguage";
import { readFeedbackWidgetMode } from "@/domain/feedback/feedbackWidgetMode";
import { installMockFeedbackTransport } from "@/domain/feedback/mockFeedbackTransport";

const CHANGE_LANGUAGE_EVENT = "changeLanguage";

export interface FeedbackWidgetProps {
  /** Accessible name for the landmark wrapping the widget. */
  readonly ariaLabel: string;
}

export const FeedbackWidget = ({ ariaLabel }: FeedbackWidgetProps) => {
  const locale = useLocale();
  const mode = readFeedbackWidgetMode();
  const isEnabled = mode !== "off";
  const [isDefined, setIsDefined] = useState(false);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    let teardownMockTransport: (() => void) | undefined;

    if (mode === "mock") {
      teardownMockTransport = installMockFeedbackTransport();
    }

    let isActive = true;

    const defineCustomElement = async (): Promise<void> => {
      await import("@newjersey/feedback-widget/feedback-widget.min.js");

      if (isActive) {
        setIsDefined(true);
      }
    };

    defineCustomElement().catch((error: unknown) => {
      // biome-ignore lint/suspicious/noConsole: a failed third-party widget load should surface in the console without breaking the page.
      console.error("Failed to load the NJ feedback widget.", error);
    });

    return () => {
      isActive = false;
      teardownMockTransport?.();
    };
  }, [isEnabled, mode]);

  useEffect(() => {
    if (!isEnabled || !isDefined) {
      return;
    }

    document.dispatchEvent(
      new CustomEvent(CHANGE_LANGUAGE_EVENT, {
        detail: toFeedbackWidgetLanguage(locale),
        bubbles: true,
      }),
    );
  }, [isEnabled, isDefined, locale]);

  if (!isEnabled) {
    return null;
  }

  return (
    // For accessibility, all page text should exist within landmark elements.
    // The widget's prompt is a bare <span>, so wrap it in a labelled <section>.
    <section aria-label={ariaLabel}>
      <feedback-widget />
    </section>
  );
};
