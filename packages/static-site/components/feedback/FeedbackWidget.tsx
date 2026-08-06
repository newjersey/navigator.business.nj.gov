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
 * Renders the feedback widget for the active locale.
 *
 * Returns nothing when the build is configured with the widget off, so pages
 * render no placeholder markup at all.
 *
 * @returns The widget element, or `null` when disabled.
 * @example
 * ```tsx
 * <FeedbackWidget />
 * ```
 */
export const FeedbackWidget = () => {
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
      throw new Error("Failed to load the NJ feedback widget.", { cause: error });
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

  return <feedback-widget />;
};
