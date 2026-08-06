import { render, screen, waitFor } from "@testing-library/react";
import { useLocale } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ApplicationMessages } from "@/domain/content/messageTypes";
import { getApplicationMessages } from "@/domain/i18n/messages";

vi.mock("next-intl", () => {
  return { useLocale: vi.fn() };
});

vi.mock("@newjersey/feedback-widget/feedback-widget.min.js", () => {
  return {};
});

const mockedUseLocale = vi.mocked(useLocale);

const englishMessages = getApplicationMessages({ locale: "en-US" });
const spanishMessages = getApplicationMessages({ locale: "es-US" });

/**
 * Imports the component fresh so module-scoped env reads re-run per test.
 */
const importFeedbackWidget = async () => {
  vi.resetModules();
  const module = await import("./FeedbackWidget");

  return module.FeedbackWidget;
};

/**
 * Imports and renders the widget with a locale's own landmark label.
 */
const renderFeedbackWidget = async (messages: ApplicationMessages) => {
  const FeedbackWidget = await importFeedbackWidget();

  return render(<FeedbackWidget ariaLabel={messages.layout.feedbackAriaLabel} />);
};

describe("FeedbackWidget", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("renders the custom element when the mode is prod", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "prod");
    mockedUseLocale.mockReturnValue("en-US");
    const { container } = await renderFeedbackWidget(englishMessages);

    expect(container.querySelector("feedback-widget")).not.toBeNull();
  });

  it("renders the custom element when the mode is mock", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "mock");
    mockedUseLocale.mockReturnValue("en-US");
    const { container } = await renderFeedbackWidget(englishMessages);

    expect(container.querySelector("feedback-widget")).not.toBeNull();
  });

  it("contains the widget in a named landmark so page content stays inside a region", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "prod");
    mockedUseLocale.mockReturnValue("en-US");
    await renderFeedbackWidget(englishMessages);

    const landmark = screen.getByRole("region", {
      name: englishMessages.layout.feedbackAriaLabel,
    });

    expect(landmark.querySelector("feedback-widget")).not.toBeNull();
  });

  it("names the landmark with the label it is given", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "prod");
    mockedUseLocale.mockReturnValue("es-US");
    await renderFeedbackWidget(spanishMessages);

    expect(
      screen.getByRole("region", { name: spanishMessages.layout.feedbackAriaLabel }),
    ).toBeDefined();
  });

  it("renders nothing when the mode is off", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "off");
    mockedUseLocale.mockReturnValue("en-US");
    const { container } = await renderFeedbackWidget(englishMessages);

    expect(container.querySelector("feedback-widget")).toBeNull();
  });

  it("renders nothing when the mode is unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "");
    mockedUseLocale.mockReturnValue("en-US");
    const { container } = await renderFeedbackWidget(englishMessages);

    expect(container.querySelector("feedback-widget")).toBeNull();
  });
});

describe("FeedbackWidget language announcements", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("announces Spanish to the widget when the locale is Spanish", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "prod");
    mockedUseLocale.mockReturnValue("es-US");
    const languageEvents: string[] = [];
    document.addEventListener("changeLanguage", (event) => {
      languageEvents.push((event as CustomEvent<string>).detail);
    });

    await renderFeedbackWidget(englishMessages);

    await waitFor(() => {
      expect(languageEvents).toContain("es");
    });
  });

  it("announces English to the widget when the locale is English", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "prod");
    mockedUseLocale.mockReturnValue("en-US");
    const languageEvents: string[] = [];
    document.addEventListener("changeLanguage", (event) => {
      languageEvents.push((event as CustomEvent<string>).detail);
    });

    await renderFeedbackWidget(englishMessages);

    await waitFor(() => {
      expect(languageEvents).toContain("en");
    });
  });

  it("does not announce a language when the widget is off", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "off");
    mockedUseLocale.mockReturnValue("es-US");
    const languageEvents: string[] = [];
    document.addEventListener("changeLanguage", (event) => {
      languageEvents.push((event as CustomEvent<string>).detail);
    });

    await renderFeedbackWidget(englishMessages);

    await waitFor(() => {
      expect(languageEvents).toHaveLength(0);
    });
  });
});
