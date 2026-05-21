import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LearnSideNav } from "@/components/learn/LearnSideNav";
import { getApplicationMessages } from "@/domain/i18n/messages";

vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  useSelectedLayoutSegment: vi.fn(),
}));

const messages = await getApplicationMessages({ locale: "en-US" });

describe("LearnSideNav", () => {
  describe("nav item order", () => {
    let navItems: HTMLElement[];

    beforeEach(async () => {
      render(<LearnSideNav content={messages.learn} />);
      navItems = screen.getAllByRole("listitem");
    });

    it("first item is Introduction linking to /learn", () => {
      const link = navItems[0].querySelector("a");
      expect(link?.textContent).toBe("Introduction");
      expect(link?.getAttribute("href")).toBe("/learn");
    });

    it("second item is Plan linking to /learn/plan", () => {
      const link = navItems[1].querySelector("a");
      expect(link?.textContent).toBe("Plan");
      expect(link?.getAttribute("href")).toBe("/learn/plan");
    });

    it("third item is Start linking to /learn/start", () => {
      const link = navItems[2].querySelector("a");
      expect(link?.textContent).toBe("Start");
      expect(link?.getAttribute("href")).toBe("/learn/start");
    });

    it("fourth item is Operate linking to /learn/operate", () => {
      const link = navItems[3].querySelector("a");
      expect(link?.textContent).toBe("Operate");
      expect(link?.getAttribute("href")).toBe("/learn/operate");
    });

    it("fifth item is Grow linking to /learn/grow", () => {
      const link = navItems[4].querySelector("a");
      expect(link?.textContent).toBe("Grow");
      expect(link?.getAttribute("href")).toBe("/learn/grow");
    });
  });

  describe("isCurrent is set based on active route segment", () => {
    it("marks Introduction as current when segment is null", async () => {
      const { useSelectedLayoutSegment } = vi.mocked(await import("next/navigation"));
      useSelectedLayoutSegment.mockReturnValue(null);

      render(<LearnSideNav content={messages.learn} />);

      expect(screen.getByRole("link", { name: "Introduction" })).toHaveClass("usa-current");
    });

    it("marks Plan as current when segment is 'plan'", async () => {
      const { useSelectedLayoutSegment } = vi.mocked(await import("next/navigation"));
      useSelectedLayoutSegment.mockReturnValue("plan");

      render(<LearnSideNav content={messages.learn} />);

      expect(screen.getByRole("link", { name: "Plan" })).toHaveClass("usa-current");
    });

    it("does not mark Introduction as current when segment is 'plan'", async () => {
      const { useSelectedLayoutSegment } = vi.mocked(await import("next/navigation"));
      useSelectedLayoutSegment.mockReturnValue("plan");

      render(<LearnSideNav content={messages.learn} />);

      expect(screen.getByRole("link", { name: "Introduction" })).not.toHaveClass("usa-current");
    });
  });
});
