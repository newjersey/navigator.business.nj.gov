import { describe, expect, it } from "vitest";
import { generateMetadata } from "./layout";

describe("generateMetadata", () => {
  it("uses the public production origin as the metadata base", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en-US" }),
    });

    expect(metadata.metadataBase?.toString()).toBe("https://business.nj.gov/");
  });
});
