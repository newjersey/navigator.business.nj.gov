import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { loadPageBySlug } from "@/domain/content/loadContent";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { generateIndustry } from "@/tests/factories";
import { StarterKitsPage } from "./StarterKitsPage";

const messages = await getApplicationMessages({ locale: "en-US" });
const starterKits = messages.learn.starterKits;
const page = loadPageBySlug("starter-kits");

const enabledIndustry = generateIndustry({ isEnabled: true });
const genericIndustry = generateIndustry({ id: "generic", name: "Generic", isEnabled: true });

vi.mock("@/domain/content/loadContent", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/domain/content/loadContent")>();
  return {
    ...actual,
    loadIndustries: () => [enabledIndustry, genericIndustry],
  };
});

describe("StarterKitsPage", () => {
  it("does not include the generic industry in the selector", async () => {
    render(await StarterKitsPage({ page, locale: "en-US" }));

    const input = screen.getByRole("combobox");
    fireEvent.click(input);

    const options = screen.getAllByRole("option");
    const optionLabels = options.map((o) => o.textContent);

    expect(optionLabels).toContain(enabledIndustry.name);
    expect(optionLabels).not.toContain("Generic");
  });

  it("renders the top industries heading from messages", async () => {
    render(await StarterKitsPage({ page, locale: "en-US" }));

    expect(
      screen.getByRole("heading", { name: starterKits.topIndustriesHeading }),
    ).toBeInTheDocument();
  });
});
