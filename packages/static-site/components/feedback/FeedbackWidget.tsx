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

/**
 * Event name the widget listens for to switch its copy.
 */
const CHANGE_LANGUAGE_EVENT = "changeLanguage";

/**
 * Describes props accepted by the feedback widget component.
 *
 * This type defines a stable shape for related data.
 */
export interface FeedbackWidgetProps {
  /** Accessible name for the landmark wrapping the widget. */
  readonly ariaLabel: string;
}

/**
 * Renders the feedback widget for the active locale.
 *
 * Returns nothing when the build is configured with the widget off, so pages
 * render no placeholder markup at all.
 *
 * The widget renders its own prompt text as a bare `<span>`, and it mounts
 * between the main landmark and the footer. Wrapping it in a labelled
 * `<section>` keeps that text inside a landmark, which axe's `region` rule
 * requires. A `<section>` only counts as a landmark once it has an accessible
 * name, so the label is required rather than optional.
 *
 * A failed widget load is logged to the console rather than raised: feedback is
 * supplementary, so it must never take down the page around it. Nothing throws,
 * so no error boundary is involved.
 *
 * @param props Feedback widget props.
 * @param props.ariaLabel Accessible name for the wrapping landmark.
 * @returns The widget landmark, or `null` when disabled.
 * @example
 * ```tsx
 * <FeedbackWidget ariaLabel="Page feedback" />
 * ```
 */
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
    <section aria-label={ariaLabel}>
      <feedback-widget />
    </section>
  );
};
