import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuickServicesSection } from "@/components/landing/QuickServicesSection";
import { getApplicationMessages } from "@/domain/i18n/messages";

const content = getApplicationMessages({ locale: "en-US" }).landing.quickServices;

describe("QuickServicesSection", () => {
  it("uses only each service title as the link text", () => {
    render(<QuickServicesSection content={content} />);

    for (const item of content.items) {
      const link = screen.getByRole("link", { name: item.title });

      expect(link).toHaveTextContent(item.title);
      expect(link).not.toHaveTextContent(item.description);
      expect(link).toHaveAttribute("href", item.link.href);
      expect(link).toHaveAccessibleDescription(item.description);
      expect(screen.getByText(item.description)).not.toBe(link);
    }
  });
});
