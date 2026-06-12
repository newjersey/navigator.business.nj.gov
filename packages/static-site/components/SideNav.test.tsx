import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SideNav } from "@/components/SideNav";

describe("SideNav", () => {
  describe("onItemSelect", () => {
    const items = [
      {
        link: { label: "Category", href: "/category", isInternal: true, opensInNewTab: false },
        isCurrent: true,
        children: [
          {
            link: { label: "Child A", href: "/child-a", isInternal: true, opensInNewTab: false },
          },
          {
            link: { label: "Child B", href: "/child-b", isInternal: true, opensInNewTab: false },
          },
        ],
      },
    ];

    it("calls onItemSelect when a child item is clicked", () => {
      const onItemSelect = vi.fn();
      render(<SideNav ariaLabel="Test nav" items={items} onItemSelect={onItemSelect} />);

      fireEvent.click(screen.getByRole("link", { name: "Child A" }));
      expect(onItemSelect).toHaveBeenCalledTimes(1);
    });
  });
});
