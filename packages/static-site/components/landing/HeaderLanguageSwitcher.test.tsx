import { render } from "@testing-library/react";
import { useLocale } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { usePathname } from "@/domain/i18n/navigation";
import { HeaderLanguageSwitcher } from "./HeaderLanguageSwitcher";

vi.mock("next-intl", () => {
  return { useLocale: vi.fn() };
});

const mockedUseLocale = vi.mocked(useLocale);
const mockedUsePathname = vi.mocked(usePathname);

describe("HeaderLanguageSwitcher", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("passes the resolved locale and pathname through to the atom", () => {
    mockedUseLocale.mockReturnValue("es-US");
    mockedUsePathname.mockReturnValue("/learn");

    const content = getApplicationMessages({ locale: "es-US" }).layout.languageSwitcher;
    render(<HeaderLanguageSwitcher content={content} />);

    const activeLink = document.querySelector('a[aria-current="true"]');
    expect(activeLink).not.toBeNull();

    expect(activeLink).toHaveAttribute("hreflang", "es-US");
    expect(activeLink).toHaveAttribute("href", "/learn");
  });

  it("defaults unknown locale values to the default locale", () => {
    mockedUseLocale.mockReturnValue("fr-FR");
    mockedUsePathname.mockReturnValue("/");

    const content = getApplicationMessages({ locale: "en-US" }).layout.languageSwitcher;
    render(<HeaderLanguageSwitcher content={content} />);

    const activeLink = document.querySelector('a[aria-current="true"]');
    expect(activeLink).not.toBeNull();

    expect(activeLink).toHaveAttribute("hreflang", "en-US");
  });
});
