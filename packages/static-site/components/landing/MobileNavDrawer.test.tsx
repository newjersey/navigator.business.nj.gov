import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MobileNavDrawer } from "@/components/landing/MobileNavDrawer";

describe("MobileNavDrawer", () => {
  it("renders children when open", () => {
    render(
      <MobileNavDrawer closeAriaLabel="Close" isOpen={true} onClose={vi.fn()} title="Test">
        <p>Drawer content</p>
      </MobileNavDrawer>,
    );
    expect(screen.getByText("Drawer content")).toBeInTheDocument();
  });

  it("renders the title in the drawer header", () => {
    render(
      <MobileNavDrawer closeAriaLabel="Close" isOpen={true} onClose={vi.fn()} title="My Nav">
        <p>content</p>
      </MobileNavDrawer>,
    );
    expect(screen.getByText("My Nav")).toBeInTheDocument();
  });

  it("renders a close button with the provided aria-label", () => {
    render(
      <MobileNavDrawer closeAriaLabel="Close menu" isOpen={true} onClose={vi.fn()} title="Nav">
        <p>content</p>
      </MobileNavDrawer>,
    );
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <MobileNavDrawer closeAriaLabel="Close menu" isOpen={true} onClose={onClose} title="Nav">
        <p>content</p>
      </MobileNavDrawer>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(
      <MobileNavDrawer closeAriaLabel="Close menu" isOpen={true} onClose={onClose} title="Nav">
        <p>content</p>
      </MobileNavDrawer>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose on Escape when drawer is closed", () => {
    const onClose = vi.fn();
    render(
      <MobileNavDrawer closeAriaLabel="Close menu" isOpen={false} onClose={onClose} title="Nav">
        <p>content</p>
      </MobileNavDrawer>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("has role=dialog and aria-modal=true", () => {
    render(
      <MobileNavDrawer closeAriaLabel="Close" isOpen={true} onClose={vi.fn()} title="Nav">
        <p>content</p>
      </MobileNavDrawer>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("calls onClose when the overlay is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <MobileNavDrawer closeAriaLabel="Close menu" isOpen={true} onClose={onClose} title="Nav">
        <p>content</p>
      </MobileNavDrawer>,
    );
    fireEvent.click(container.querySelector(".usa-mobile-nav-overlay")!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
