import { describe, expect, it } from "vitest";
import { toFeedbackWidgetLanguage } from "./feedbackWidgetLanguage";

describe("toFeedbackWidgetLanguage", () => {
  it("maps the Spanish locale to the widget's Spanish code", () => {
    expect(toFeedbackWidgetLanguage("es-US")).toBe("es");
  });

  it("maps the English locale to the widget's English code", () => {
    expect(toFeedbackWidgetLanguage("en-US")).toBe("en");
  });

  it("falls back to English for locales the widget does not support", () => {
    expect(toFeedbackWidgetLanguage("ar-US")).toBe("en");
  });

  it("falls back to English for unrecognized values", () => {
    expect(toFeedbackWidgetLanguage("")).toBe("en");
  });
});
