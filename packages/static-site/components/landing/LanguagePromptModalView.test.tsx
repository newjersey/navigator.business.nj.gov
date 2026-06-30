import { fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";

import { LanguagePromptModalView } from "./LanguagePromptModalView";

/**
 * Describes overrides for rendering the modal view in tests.
 */
interface RenderViewParams {
  /** Handler invoked when the visitor chooses to stay. */
  readonly onStay?: () => void;
  /** Handler invoked when the visitor chooses to switch. */
  readonly onRedirect?: () => void;
  /** Whether the modal is open. */
  readonly isOpen?: boolean;
}

/**
 * Renders the modal view with default copy and optional handler overrides.
 */
const renderView = ({
  onStay = vi.fn(),
  onRedirect = vi.fn(),
  isOpen = true,
}: RenderViewParams = {}) => {
  return render(
    <LanguagePromptModalView
      body="This page is available in another language."
      closeLabel="Close"
      isOpen={isOpen}
      onRedirect={onRedirect}
      onStay={onStay}
      redirectLabel="Switch to Español"
      stayLabel="Stay on this page"
      title="View this page in your language?"
    />,
  );
};

describe("LanguagePromptModalView", () => {
  it("renders the title, body, and both action buttons", () => {
    renderView();

    expect(
      screen.getByRole("heading", { name: "View this page in your language?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("This page is available in another language.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Switch to Español" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stay on this page" })).toBeInTheDocument();
  });

  it("labels the close control", () => {
    renderView();

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("fires onRedirect when the switch button is clicked", () => {
    const onRedirect = vi.fn();
    renderView({ onRedirect });

    fireEvent.click(screen.getByRole("button", { name: "Switch to Español" }));

    expect(onRedirect).toHaveBeenCalledTimes(1);
  });

  it("fires onStay when the stay button is clicked", () => {
    const onStay = vi.fn();
    renderView({ onStay });

    fireEvent.click(screen.getByRole("button", { name: "Stay on this page" }));

    expect(onStay).toHaveBeenCalledTimes(1);
  });

  it("passes automated accessibility checks", async () => {
    const view = renderView();

    const results = await axe.run(view.container, {
      rules: { "color-contrast": { enabled: false } },
    });

    expect(results.violations).toHaveLength(0);
  });
});
