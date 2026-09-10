import { render, screen } from "@testing-library/react";
import { useLocale } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { getPathname } from "@/domain/i18n/navigation";
import { HeaderSearch } from "./HeaderSearch";

vi.mock("next-intl", () => {
  return { useLocale: vi.fn() };
});

const mockedUseLocale = vi.mocked(useLocale);
const mockedGetPathname = vi.mocked(getPathname);

describe("HeaderSearch with search enabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("renders a GET search form posting to the locale-resolved search action", () => {
    vi.stubEnv("NEXT_PUBLIC_SEARCH_ENABLED", "true");
    mockedUseLocale.mockReturnValue("en-US");
    mockedGetPathname.mockReturnValue("/search");

    const content = getApplicationMessages({ locale: "en-US" }).layout.header;
    render(<HeaderSearch content={content} />);

    expect(mockedGetPathname).toHaveBeenCalledWith({
      href: content.searchAction,
      locale: "en-US",
    });

    const form = screen.getByRole("search");
    expect(form).toHaveAttribute("action", "/search");

    const input = screen.getByRole("searchbox", { name: content.searchInputLabel });
    expect(input).toHaveAttribute("name", "q");
  });

  it("labels the search region with localized content, not a hardcoded string", () => {
    vi.stubEnv("NEXT_PUBLIC_SEARCH_ENABLED", "true");
    mockedUseLocale.mockReturnValue("es-US");
    mockedGetPathname.mockReturnValue("/es-US/search");

    const content = getApplicationMessages({ locale: "es-US" }).layout.header;
    render(<HeaderSearch content={content} />);

    expect(screen.getByRole("search").closest("section")).toHaveAttribute(
      "aria-label",
      content.searchRegionLabel,
    );
  });

  it("keeps an accessible label for the input, visually hidden rather than placeholder-only", () => {
    vi.stubEnv("NEXT_PUBLIC_SEARCH_ENABLED", "true");
    mockedUseLocale.mockReturnValue("en-US");
    mockedGetPathname.mockReturnValue("/search");

    const content = getApplicationMessages({ locale: "en-US" }).layout.header;
    render(<HeaderSearch content={content} />);

    const label = screen.getByText(content.searchInputLabel);
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("usa-sr-only");
    expect(screen.getByRole("searchbox", { name: content.searchInputLabel })).not.toHaveAttribute(
      "placeholder",
    );
  });

  it("computes the form action from the current locale via getPathname", () => {
    vi.stubEnv("NEXT_PUBLIC_SEARCH_ENABLED", "true");
    mockedUseLocale.mockReturnValue("es-US");
    mockedGetPathname.mockReturnValue("/es-US/search");

    const content = getApplicationMessages({ locale: "es-US" }).layout.header;
    render(<HeaderSearch content={content} />);

    expect(mockedGetPathname).toHaveBeenCalledWith({
      href: content.searchAction,
      locale: "es-US",
    });
    expect(screen.getByRole("search")).toHaveAttribute("action", "/es-US/search");
  });

  it("defaults unknown locale values to the default locale before resolving the action", () => {
    vi.stubEnv("NEXT_PUBLIC_SEARCH_ENABLED", "true");
    mockedUseLocale.mockReturnValue("fr-FR");
    mockedGetPathname.mockReturnValue("/search");

    const content = getApplicationMessages({ locale: "en-US" }).layout.header;
    render(<HeaderSearch content={content} />);

    expect(mockedGetPathname).toHaveBeenCalledWith({
      href: content.searchAction,
      locale: "en-US",
    });
  });
});

describe("HeaderSearch with search disabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("renders nothing when the search flag is off", () => {
    vi.stubEnv("NEXT_PUBLIC_SEARCH_ENABLED", "false");
    mockedUseLocale.mockReturnValue("en-US");

    const content = getApplicationMessages({ locale: "en-US" }).layout.header;
    const { container } = render(<HeaderSearch content={content} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when the search flag is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SEARCH_ENABLED", "");
    mockedUseLocale.mockReturnValue("en-US");

    const content = getApplicationMessages({ locale: "en-US" }).layout.header;
    const { container } = render(<HeaderSearch content={content} />);

    expect(container.firstChild).toBeNull();
  });
});
