import { describe, expect, it } from "vitest";

import { buildPageMetadata } from "./pageMetadata";

describe("pageMetadata", () => {
  describe("buildPageMetadata", () => {
    it("brands the title and matches it across title, openGraph, and twitter", () => {
      const metadata = buildPageMetadata({
        pageTitle: "Government Contracting",
        pathnameWithoutLocale: "/pages/government-contracting",
      });

      expect(metadata.title).toEqual({ absolute: "Government Contracting | Business.NJ.gov" });
      expect(metadata.openGraph?.title).toEqual(metadata.title);
      expect(metadata.twitter?.title).toEqual(metadata.title);
    });

    it("carries the social preview image into both openGraph and twitter", () => {
      const metadata = buildPageMetadata({
        pageTitle: "Government Contracting",
        pathnameWithoutLocale: "/pages/government-contracting",
      });

      expect(metadata.openGraph?.images).toEqual([
        expect.objectContaining({ url: "/assets/njwds/dist/img/nj-logo-gray-20.png" }),
      ]);
      expect(metadata.twitter?.images).toEqual(["/assets/njwds/dist/img/nj-logo-gray-20.png"]);
    });

    it("delegates alternates to buildAlternateLanguages", () => {
      const metadata = buildPageMetadata({
        pageTitle: "Government Contracting",
        pathnameWithoutLocale: "/pages/government-contracting",
      });

      expect(metadata.alternates?.canonical).toBe("/pages/government-contracting");
      expect(metadata.alternates?.languages).toEqual(
        expect.objectContaining({ "en-US": "/pages/government-contracting" }),
      );
    });

    it("includes a trimmed description on the root, openGraph, and twitter fields", () => {
      const metadata = buildPageMetadata({
        pageTitle: "Government Contracting",
        pathnameWithoutLocale: "/pages/government-contracting",
        description: "  Learn how to bid on state contracts.  ",
      });

      expect(metadata.description).toBe("Learn how to bid on state contracts.");
      expect(metadata.openGraph?.description).toBe("Learn how to bid on state contracts.");
      expect(metadata.twitter?.description).toBe("Learn how to bid on state contracts.");
    });

    it("omits the description key entirely when no description is given", () => {
      const metadata = buildPageMetadata({
        pageTitle: "Government Contracting",
        pathnameWithoutLocale: "/pages/government-contracting",
      });

      expect("description" in metadata).toBe(false);
      expect(metadata.openGraph && "description" in metadata.openGraph).toBe(false);
      expect(metadata.twitter && "description" in metadata.twitter).toBe(false);
    });

    it("omits the description key when given a blank string", () => {
      const metadata = buildPageMetadata({
        pageTitle: "Government Contracting",
        pathnameWithoutLocale: "/pages/government-contracting",
        description: "   ",
      });

      expect("description" in metadata).toBe(false);
    });
  });
});
