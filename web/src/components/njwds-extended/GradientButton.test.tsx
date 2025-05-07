import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { GradientButton } from "./GradientButton";

describe("GradientButton", () => {
  test("renders button with text", () => {
    render(<GradientButton text="Click me" />);

    const buttonText = screen.getByText("Click me");
    expect(buttonText).toBeInTheDocument();
    expect(buttonText).toHaveClass("gradient-button-text");
  });

  test("renders button with icon when provided", () => {
    render(<GradientButton text="Click me" icon="test-icon" />);

    const icon = screen.getByRole("presentation");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("src", "/img/test-icon.svg");
    expect(icon).toHaveAttribute("alt", "test-icon icon");
  });

  test("does not render icon when not provided", () => {
    render(<GradientButton text="No Icon" />);

    const icons = screen.queryAllByRole("presentation");
    expect(icons.length).toBe(0);
  });

  test("handles onClick event", () => {
    const handleClick = jest.fn();
    render(<GradientButton text="Click me" onClick={handleClick} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("applies aria-label when provided", () => {
    render(<GradientButton text="Click me" ariaLabel="Test aria label" />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Test aria label");
  });

  test("applies role when provided", () => {
    render(<GradientButton text="Click me" role="link" />);

    const button = screen.getByRole("link");
    expect(button).toHaveTextContent("Click me");
  });
});
