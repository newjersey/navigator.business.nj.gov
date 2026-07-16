import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GovDeliverySignupForm } from "./GovDeliverySignupForm";

const removeInjectedLoaders = (): void => {
  for (const script of document.querySelectorAll('script[src*="Signup.js"]')) {
    script.remove();
  }
};

afterEach(removeInjectedLoaders);

describe("GovDeliverySignupForm", () => {
  it("injects the GovDelivery loader with the account and signup id", () => {
    const { container } = render(<GovDeliverySignupForm />);

    const loader = container.querySelector('script[src*="Signup.js"]');
    expect(loader).not.toBeNull();
    expect(loader?.getAttribute("src")).toBe("https://public.govdelivery.com/assets/Signup.js");
    expect(loader?.getAttribute("data-account-code")).toBe("NJGOV");
    expect(loader?.getAttribute("data-signup-id")).toBe("31933");
  });

  it("does not set data-element-id, so the loader injects the form inline", () => {
    const { container } = render(<GovDeliverySignupForm />);

    const loader = container.querySelector('script[src*="Signup.js"]');
    expect(loader?.hasAttribute("data-element-id")).toBe(false);
  });

  it("injects the loader only once", () => {
    const { container, rerender } = render(<GovDeliverySignupForm />);
    rerender(<GovDeliverySignupForm />);

    expect(container.querySelectorAll('script[src*="Signup.js"]')).toHaveLength(1);
  });
});
