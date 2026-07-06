import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getApplicationMessages } from "@/domain/i18n/messages";
import PageNotFound from "./not-found";

vi.mock("next-intl/server", () => ({
  getLocale: vi.fn(),
}));

const { getLocale } = await import("next-intl/server");

const enMessages = await getApplicationMessages({ locale: "en-US" });
const esMessages = await getApplicationMessages({ locale: "es-US" });

describe("PageNotFound", () => {
  it("renders the localized title and description for the resolved locale", async () => {
    vi.mocked(getLocale).mockResolvedValue("en-US");

    render(await PageNotFound());

    expect(
      screen.getByRole("heading", { name: enMessages.pageNotFound.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(enMessages.pageNotFound.description)).toBeInTheDocument();
  });

  it("renders a link back to the home page", async () => {
    vi.mocked(getLocale).mockResolvedValue("en-US");

    render(await PageNotFound());

    expect(
      screen.getByRole("link", { name: enMessages.pageNotFound.homeLink.label }),
    ).toHaveAttribute("href", enMessages.pageNotFound.homeLink.href);
  });

  it("renders an Intercom launcher button for chatting with an expert", async () => {
    vi.mocked(getLocale).mockResolvedValue("en-US");

    render(await PageNotFound());

    const chatButton = screen.getByRole("button", {
      name: enMessages.pageNotFound.chatWithExpertLabel,
    });
    expect(chatButton).toHaveClass("intercomlaunch");
  });

  it("does not render a search bar", async () => {
    vi.mocked(getLocale).mockResolvedValue("en-US");

    render(await PageNotFound());

    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("falls back to the default locale when the resolved locale is unsupported", async () => {
    vi.mocked(getLocale).mockResolvedValue("fr-FR");

    render(await PageNotFound());

    expect(
      screen.getByRole("heading", { name: enMessages.pageNotFound.title }),
    ).toBeInTheDocument();
  });

  it("renders localized content for es-US", async () => {
    vi.mocked(getLocale).mockResolvedValue("es-US");

    render(await PageNotFound());

    expect(
      screen.getByRole("heading", { name: esMessages.pageNotFound.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: esMessages.pageNotFound.homeLink.label }),
    ).toHaveAttribute("href", esMessages.pageNotFound.homeLink.href);
  });
});
