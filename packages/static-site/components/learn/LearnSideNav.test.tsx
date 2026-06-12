import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LearnSideNav } from "@/components/learn/LearnSideNav";
import { CATEGORY_HIERARCHY } from "@/domain/categories";
import { getApplicationMessages } from "@/domain/i18n/messages";

vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  usePathname: vi.fn(),
}));

const messages = await getApplicationMessages({ locale: "en-US" });

const categoryChildren = Object.fromEntries(
  messages.learn.categories.map((category) => {
    const pages = (CATEGORY_HIERARCHY[category.key]?.children ?? [])
      .filter((page) => page.hideFromCategoryPage !== "true")
      .map((page) => ({
        link: {
          label: page.name,
          href: `/pages/${page.slug}`,
          isInternal: true,
          opensInNewTab: false,
        },
      }));

    const introItem = {
      link: {
        label: messages.learn.sideNav.learnCategory.title,
        href: category.link.href,
        isInternal: true,
        opensInNewTab: false,
      },
    };

    return [category.key, [introItem, ...pages]];
  }),
);

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: test suite
describe("LearnSideNav", () => {
  describe("nav item order", () => {
    let navItems: HTMLElement[];

    beforeEach(async () => {
      const { usePathname } = vi.mocked(await import("next/navigation"));
      usePathname.mockReturnValue("/en-US/learn");

      render(<LearnSideNav content={messages.learn} categoryChildren={categoryChildren} />);
      const topList = screen.getByRole("navigation").querySelector(":scope > .usa-sidenav");
      if (topList) navItems = Array.from(topList.querySelectorAll(":scope > .usa-sidenav__item"));
    });

    it("first item is Introduction linking to /learn", () => {
      const link = navItems[0].querySelector("a");
      expect(link?.textContent).toBe("Introduction");
      expect(link?.getAttribute("href")).toBe("/learn");
    });

    it("second item is Plan as an expandable button", () => {
      const button = navItems[1].querySelector("button");
      expect(button?.textContent).toContain("Plan");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("third item is Start as an expandable button", () => {
      const button = navItems[2].querySelector("button");
      expect(button?.textContent).toContain("Start");
    });

    it("fourth item is Operate as an expandable button", () => {
      const button = navItems[3].querySelector("button");
      expect(button?.textContent).toContain("Operate");
    });

    it("fifth item is Grow as an expandable button", () => {
      const button = navItems[4].querySelector("button");
      expect(button?.textContent).toContain("Grow");
    });
  });

  describe("isCurrent is set based on active route", () => {
    it("marks Introduction as current when on /learn", async () => {
      const { usePathname } = vi.mocked(await import("next/navigation"));
      usePathname.mockReturnValue("/en-US/learn");

      render(<LearnSideNav content={messages.learn} categoryChildren={categoryChildren} />);

      expect(screen.getByRole("link", { name: "Introduction" })).toHaveClass("usa-current");
    });

    it("marks Plan as current when on /plan", async () => {
      const { usePathname } = vi.mocked(await import("next/navigation"));
      usePathname.mockReturnValue("/en-US/plan");

      render(<LearnSideNav content={messages.learn} categoryChildren={categoryChildren} />);

      expect(screen.getByRole("button", { name: /Plan/ })).toHaveClass("usa-current");
    });

    it("does not mark top-level Introduction as current when on /plan", async () => {
      const { usePathname } = vi.mocked(await import("next/navigation"));
      usePathname.mockReturnValue("/en-US/plan");

      render(<LearnSideNav content={messages.learn} categoryChildren={categoryChildren} />);

      const introLinks = screen.getAllByRole("link", { name: "Introduction" });
      const topLevelIntro = introLinks.find((link) => link.getAttribute("href") === "/learn");
      expect(topLevelIntro).not.toHaveClass("usa-current");
    });

    it("marks both category and child as current when on a sub-page", async () => {
      const { usePathname } = vi.mocked(await import("next/navigation"));
      const startChildren = categoryChildren.start;
      const firstChildPage = startChildren[1];
      usePathname.mockReturnValue(`/en-US${firstChildPage.link.href}`);

      render(<LearnSideNav content={messages.learn} categoryChildren={categoryChildren} />);

      expect(screen.getByRole("button", { name: /Start/ })).toHaveClass("usa-current");
      expect(screen.getByRole("link", { name: firstChildPage.link.label })).toHaveClass(
        "usa-current",
      );
    });
  });

  describe("mobile - show/hide full menu toggle", () => {
    const { showFullMenuLabel, hideFullMenuLabel } = messages.learn.sideNav;

    beforeEach(async () => {
      const { usePathname } = vi.mocked(await import("next/navigation"));
      usePathname.mockReturnValue("/en-US/plan");
    });

    it("renders show full menu button by default", () => {
      render(<LearnSideNav content={messages.learn} categoryChildren={categoryChildren} />);
      expect(screen.getByRole("button", { name: showFullMenuLabel })).toBeInTheDocument();
    });

    it("marks non-current categories as collapsible", () => {
      const { container } = render(
        <LearnSideNav content={messages.learn} categoryChildren={categoryChildren} />,
      );
      const collapsibleItems = container.querySelectorAll(".sidenav-collapsible-item");
      expect(collapsibleItems.length).toBeGreaterThan(0);

      const currentButton = container.querySelector(".usa-current");
      expect(currentButton?.closest(".sidenav-collapsible-item")).toBeNull();
    });

    it("wraps nav in sidenav--collapsed class by default", () => {
      const { container } = render(
        <LearnSideNav content={messages.learn} categoryChildren={categoryChildren} />,
      );
      expect(container.querySelector(".sidenav--collapsed")).toBeInTheDocument();
    });

    it("removes collapsed class and shows hide full menu after clicking toggle", () => {
      const { container } = render(
        <LearnSideNav content={messages.learn} categoryChildren={categoryChildren} />,
      );
      const toggleButton = screen.getByRole("button", { name: showFullMenuLabel });
      fireEvent.click(toggleButton);

      expect(container.querySelector(".sidenav--collapsed")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: hideFullMenuLabel })).toBeInTheDocument();
    });

    it("collapses menu when a child nav item is clicked", () => {
      const { container } = render(
        <LearnSideNav content={messages.learn} categoryChildren={categoryChildren} />,
      );
      const toggleButton = screen.getByRole("button", { name: showFullMenuLabel });
      fireEvent.click(toggleButton);
      expect(container.querySelector(".sidenav--collapsed")).not.toBeInTheDocument();

      const sublist = container.querySelector(".usa-sidenav__sublist");
      const childLink = sublist?.querySelector("a");
      // biome-ignore lint/style/noNonNullAssertion: Needed for the test
      fireEvent.click(childLink!);
      expect(container.querySelector(".sidenav--collapsed")).toBeInTheDocument();
    });
  });
});
