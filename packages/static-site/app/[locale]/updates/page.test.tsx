import { describe, expect, it } from "vitest";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { generateMetadata } from "./page";

describe("generateMetadata", () => {
  it("brands the title with the updates page's own title and its intro as the description", async () => {
    const { updates } = getApplicationMessages({ locale: "en-US" });

    const metadata = await generateMetadata({ params: Promise.resolve({ locale: "en-US" }) });

    expect(metadata.title).toEqual({ absolute: `${updates.title} | Business.NJ.gov` });
    expect(metadata.description).toBe(updates.intro);
    expect(metadata.openGraph?.title).toEqual(metadata.title);
    expect(metadata.twitter?.title).toEqual(metadata.title);
    expect(metadata.alternates?.canonical).toBe("/updates");
  });
});
