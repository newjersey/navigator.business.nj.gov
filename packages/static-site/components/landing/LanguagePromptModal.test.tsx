import { render, screen } from "@testing-library/react";
import { useLocale } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePathname, useRouter } from "@/domain/i18n/navigation";
import { LANGUAGE_PROMPT_DISMISSED_COOKIE } from "@/domain/siteConfig";
import { LanguagePromptModal } from "./LanguagePromptModal";

vi.mock("next-intl", () => {
  return { useLocale: vi.fn() };
});

const mockedUseLocale = vi.mocked(useLocale);
const mockedUsePathname = vi.mocked(usePathname);
const mockedUseRouter = vi.mocked(useRouter);
const replaceMock = vi.fn();

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
    mockedUseRouter.mockReturnValue({
      replace: replaceMock,
    } as unknown as ReturnType<typeof useRouter>);
    document.cookie = `${LANGUAGE_PROMPT_DISMISSED_COOKIE}=; max-age=0; path=/`;
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
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("navigates to the preferred locale and sets the dismissal cookie when switching", () => {
    mockedUseLocale.mockReturnValue("en-US");
    setBrowserLanguages(["es-US"]);

    renderModal();
    screen.getByRole("button", { name: /Español/ }).click();

    expect(document.cookie).toContain(`${LANGUAGE_PROMPT_DISMISSED_COOKIE}=true`);
    expect(replaceMock).toHaveBeenCalledWith("/learn", { locale: "es-US" });
  });
});
