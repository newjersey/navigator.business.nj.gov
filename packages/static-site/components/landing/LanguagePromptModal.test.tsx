/** biome-ignore-all lint/suspicious/noDocumentCookie: tests set and clear cookies directly to drive the modal's dismissal state. */
import { render, screen } from "@testing-library/react";
import { useLocale } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePathname } from "@/domain/i18n/navigation";
import { LANGUAGE_PROMPT_DISMISSED_COOKIE, NEXT_LOCALE_COOKIE_NAME } from "@/domain/siteConfig";
import { LanguagePromptModal } from "./LanguagePromptModal";

vi.mock("next-intl", () => {
  return { useLocale: vi.fn() };
});

const mockedUseLocale = vi.mocked(useLocale);
const mockedUsePathname = vi.mocked(usePathname);
const assignMock = vi.fn();

/**
 * Overrides the browser's reported language preferences for one test.
 */
const setBrowserLanguages = (languages: readonly string[]): void => {
  Object.defineProperty(window.navigator, "languages", {
    value: languages,
    configurable: true,
  });
};

const renderModal = () => render(<LanguagePromptModal />);

describe("LanguagePromptModal", () => {
  beforeEach(() => {
    mockedUsePathname.mockReturnValue("/learn");
    Object.defineProperty(window, "location", {
      value: { assign: assignMock },
      writable: true,
    });
    document.cookie = `${LANGUAGE_PROMPT_DISMISSED_COOKIE}=; max-age=0; path=/`;
    document.cookie = `${NEXT_LOCALE_COOKIE_NAME}=; max-age=0; path=/`;
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.cookie = `${LANGUAGE_PROMPT_DISMISSED_COOKIE}=; max-age=0; path=/`;
  });

  it("prompts when browser language differs from current locale", () => {
    mockedUseLocale.mockReturnValue("en-US");
    setBrowserLanguages(["es-US"]);

    renderModal();

    // Entire dialog is in the preferred (es-US) language.
    expect(screen.getByRole("heading", { name: /su idioma/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Español/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Permanecer/i })).toBeInTheDocument();
  });

  it("does not prompt when browser language matches current locale", () => {
    mockedUseLocale.mockReturnValue("en-US");
    setBrowserLanguages(["en-US"]);

    renderModal();

    expect(screen.queryByRole("heading", { name: /language/i })).not.toBeInTheDocument();
  });

  it("does not prompt when the dismissal cookie is present", () => {
    mockedUseLocale.mockReturnValue("en-US");
    setBrowserLanguages(["es-US"]);
    document.cookie = `${LANGUAGE_PROMPT_DISMISSED_COOKIE}=true; path=/`;

    renderModal();

    expect(screen.queryByRole("heading", { name: /language/i })).not.toBeInTheDocument();
  });

  it("sets the dismissal cookie without navigating when staying", () => {
    mockedUseLocale.mockReturnValue("en-US");
    setBrowserLanguages(["es-US"]);

    renderModal();
    screen.getByRole("button", { name: /Permanecer/i }).click();

    expect(document.cookie).toContain(`${LANGUAGE_PROMPT_DISMISSED_COOKIE}=true`);
    expect(assignMock).not.toHaveBeenCalled();
  });

  it("navigates to the preferred locale and sets the cookies when switching", () => {
    mockedUseLocale.mockReturnValue("en-US");
    setBrowserLanguages(["es-US"]);

    renderModal();
    screen.getByRole("button", { name: /Español/ }).click();

    expect(document.cookie).toContain(`${LANGUAGE_PROMPT_DISMISSED_COOKIE}=true`);
    expect(document.cookie).toContain(`${NEXT_LOCALE_COOKIE_NAME}=es-US`);
    expect(assignMock).toHaveBeenCalledWith("/es-US/learn");
  });
});
