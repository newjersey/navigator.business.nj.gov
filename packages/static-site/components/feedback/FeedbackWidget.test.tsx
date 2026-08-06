import { render, waitFor } from "@testing-library/react";
import { useLocale } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => {
  return { useLocale: vi.fn() };
});

vi.mock("@newjersey/feedback-widget/feedback-widget.min.js", () => {
  return {};
});

const mockedUseLocale = vi.mocked(useLocale);

/**
 * Imports the component fresh so module-scoped env reads re-run per test.
 */
const importFeedbackWidget = async () => {
  vi.resetModules();
  const module = await import("./FeedbackWidget");

  return module.FeedbackWidget;
};

describe("FeedbackWidget", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("renders the custom element when the mode is prod", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "prod");
    mockedUseLocale.mockReturnValue("en-US");
    const FeedbackWidget = await importFeedbackWidget();

    const { container } = render(<FeedbackWidget />);

    expect(container.querySelector("feedback-widget")).not.toBeNull();
  });

  it("renders the custom element when the mode is mock", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "mock");
    mockedUseLocale.mockReturnValue("en-US");
    const FeedbackWidget = await importFeedbackWidget();

    const { container } = render(<FeedbackWidget />);

    expect(container.querySelector("feedback-widget")).not.toBeNull();
  });

  it("renders nothing when the mode is off", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "off");
    mockedUseLocale.mockReturnValue("en-US");
    const FeedbackWidget = await importFeedbackWidget();

    const { container } = render(<FeedbackWidget />);

    expect(container.querySelector("feedback-widget")).toBeNull();
  });

  it("renders nothing when the mode is unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "");
    mockedUseLocale.mockReturnValue("en-US");
    const FeedbackWidget = await importFeedbackWidget();

    const { container } = render(<FeedbackWidget />);

    expect(container.querySelector("feedback-widget")).toBeNull();
  });

  it("announces Spanish to the widget when the locale is Spanish", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "prod");
    mockedUseLocale.mockReturnValue("es-US");
    const FeedbackWidget = await importFeedbackWidget();
    const languageEvents: string[] = [];
    document.addEventListener("changeLanguage", (event) => {
      languageEvents.push((event as CustomEvent<string>).detail);
    });

    render(<FeedbackWidget />);

    await waitFor(() => {
      expect(languageEvents).toContain("es");
    });
  });

  it("announces English to the widget when the locale is English", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "prod");
    mockedUseLocale.mockReturnValue("en-US");
    const FeedbackWidget = await importFeedbackWidget();
    const languageEvents: string[] = [];
    document.addEventListener("changeLanguage", (event) => {
      languageEvents.push((event as CustomEvent<string>).detail);
    });

    render(<FeedbackWidget />);

    await waitFor(() => {
      expect(languageEvents).toContain("en");
    });
  });

  it("does not announce a language when the widget is off", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "off");
    mockedUseLocale.mockReturnValue("es-US");
    const FeedbackWidget = await importFeedbackWidget();
    const languageEvents: string[] = [];
    document.addEventListener("changeLanguage", (event) => {
      languageEvents.push((event as CustomEvent<string>).detail);
    });

    render(<FeedbackWidget />);

    await waitFor(() => {
      expect(languageEvents).toHaveLength(0);
    });
  });
});
