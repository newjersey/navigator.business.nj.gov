import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CollapsibleSection } from "./CollapsibleSection";

describe("CollapsibleSection", () => {
  it("renders expanded with aria-expanded='true' and visible content when defaultOpen", () => {
    render(
      <CollapsibleSection sectionId="page-section-2" heading="Section Two" defaultOpen={true}>
        <p>Section two body</p>
      </CollapsibleSection>,
    );

    const button = screen.getByRole("button", { name: "Section Two" });
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Section two body")).toBeVisible();
  });

  it("renders collapsed with aria-expanded='false' and hidden content when not defaultOpen", () => {
    render(
      <CollapsibleSection sectionId="page-section-3" heading="Section Three" defaultOpen={false}>
        <p>Section three body</p>
      </CollapsibleSection>,
    );

    const button = screen.getByRole("button", { name: "Section Three" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Section three body")).not.toBeVisible();
  });

  it("toggles open and closed on click", async () => {
    const user = userEvent.setup();
    render(
      <CollapsibleSection sectionId="page-section-4" heading="Section Four" defaultOpen={false}>
        <p>Section four body</p>
      </CollapsibleSection>,
    );

    const button = screen.getByRole("button", { name: "Section Four" });
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Section four body")).toBeVisible();

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Section four body")).not.toBeVisible();
  });

  it("sets aria-controls on the button to the content element's id", () => {
    render(
      <CollapsibleSection sectionId="page-section-5" heading="Section Five" defaultOpen={true}>
        <p>Section five body</p>
      </CollapsibleSection>,
    );

    const button = screen.getByRole("button", { name: "Section Five" });
    const contentId = button.getAttribute("aria-controls");
    expect(contentId).toBe("page-section-5-content");
    expect(document.getElementById(contentId as string)).toContainElement(
      screen.getByText("Section five body"),
    );
  });

  it("renders the button inside a .usa-accordion__heading", () => {
    render(
      <CollapsibleSection sectionId="page-section-6" heading="Section Six" defaultOpen={true}>
        <p>Section six body</p>
      </CollapsibleSection>,
    );

    const button = screen.getByRole("button", { name: "Section Six" });
    expect(button.closest(".usa-accordion__heading")).not.toBeNull();
  });
});
