/**
 * Guards every route against shipping a non-descriptive `<title>`.
 *
 * SiteImprove flagged 13 URLs sharing the generic layout title
 * (`messages.metadata.title`) because their `generateMetadata` returned only
 * `{ alternates }` and inherited it. This test walks every `page.tsx` under
 * `app/`, resolves its real params, and asserts its metadata is branded and
 * consistent across `<title>`, `og:title`, and `twitter:title` — using real
 * content and messages, not mocks, so the assertion also proves the content
 * actually yields a title. A route can opt out only via
 * `ROUTES_WITHOUT_OWN_TITLE`, with a reason that is diff-visible in review.
 */

import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { describe, expect, it } from "vitest";

import { getApplicationMessages } from "@/domain/i18n/messages";
import { SITE_TITLE_SUFFIX } from "@/domain/siteConfig";
import { ROUTES_WITHOUT_OWN_TITLE } from "./routeMetadataAllowlist";

const APP_DIR = path.join(__dirname);

/**
 * Derives a route id from a `page.tsx` file path, relative to `app/`, with
 * route-group segments (e.g. `(learn)`) removed.
 *
 * @param pageFilePath Absolute or `app/`-relative path to a `page.tsx` file.
 * @returns The route id, e.g. `[locale]/updates/[slug]`.
 */
const deriveRouteId = (pageFilePath: string): string => {
  const relative = path.relative(APP_DIR, pageFilePath);
  const withoutFile = relative.replace(/[/\\]page\.tsx$/, "");

  return withoutFile
    .split(path.sep)
    .filter((segment) => !/^\(.*\)$/.test(segment))
    .join("/");
};

interface RouteModule {
  readonly generateMetadata?: (props: {
    params: Promise<Record<string, string>>;
  }) => Metadata | Promise<Metadata>;
  readonly generateStaticParams?: () =>
    | readonly Record<string, string>[]
    | Promise<readonly Record<string, string>[]>;
}

/**
 * Resolves the list of param sets a route should be checked with.
 *
 * `[locale]` always resolves to `"en-US"`. Any other dynamic segment must be
 * resolvable via the route's own `generateStaticParams`, so a new dynamic
 * route with neither that nor an allowlist entry fails loudly instead of
 * being silently skipped.
 *
 * @param routeId Route id derived from its file path.
 * @param routeModule The imported route module.
 * @returns One params object per case the route should be checked with.
 */
const resolveParamCases = async (
  routeId: string,
  routeModule: RouteModule,
): Promise<readonly Record<string, string>[]> => {
  const dynamicSegments = routeId.match(/\[[^\]]+\]/g) ?? [];
  const nonLocaleDynamicSegments = dynamicSegments.filter((segment) => segment !== "[locale]");

  if (nonLocaleDynamicSegments.length === 0) {
    return [{ locale: "en-US" }];
  }

  if (!routeModule.generateStaticParams) {
    throw new Error(
      `Route "${routeId}" has dynamic segments (${nonLocaleDynamicSegments.join(", ")}) but no ` +
        "generateStaticParams to resolve them for this test.",
    );
  }

  const staticParams = await routeModule.generateStaticParams();

  return staticParams.map((params) => ({ locale: "en-US", ...params }));
};

const resolveTitleText = (title: Metadata["title"]): string | undefined => {
  if (typeof title === "string") {
    return title;
  }

  if (title && typeof title === "object" && "absolute" in title) {
    return title.absolute;
  }

  return undefined;
};

const pageFilePaths = fs.globSync("app/**/page.tsx", { cwd: path.join(APP_DIR, "..") });
const routeIds = pageFilePaths.map((filePath) => deriveRouteId(path.join(APP_DIR, "..", filePath)));

describe("ROUTES_WITHOUT_OWN_TITLE", () => {
  it("only lists routes that currently exist", () => {
    for (const routeId of Object.keys(ROUTES_WITHOUT_OWN_TITLE)) {
      expect(routeIds).toContain(routeId);
    }
  });
});

describe.each(
  pageFilePaths.map((filePath) => ({
    filePath,
    routeId: deriveRouteId(path.join(APP_DIR, "..", filePath)),
  })),
)("route $routeId", ({ filePath, routeId }) => {
  const exemptionReason = ROUTES_WITHOUT_OWN_TITLE[routeId];

  if (exemptionReason !== undefined) {
    it.skip(`exempt: ${exemptionReason}`, () => {});
    return;
  }

  it("exports generateMetadata and returns a branded, consistent title", async () => {
    const routeModule: RouteModule = await import(path.join(APP_DIR, "..", filePath));

    expect(
      routeModule.generateMetadata,
      `"${routeId}" has no generateMetadata. Call buildPageMetadata from ` +
        '"@/domain/metadata/pageMetadata", or add a ROUTES_WITHOUT_OWN_TITLE entry with a reason.',
    ).toBeDefined();

    const paramCases = await resolveParamCases(routeId, routeModule);
    const genericTitle = getApplicationMessages({ locale: "en-US" }).metadata.title;

    for (const params of paramCases) {
      // biome-ignore lint/style/noNonNullAssertion: asserted defined above.
      const metadata = await routeModule.generateMetadata!({ params: Promise.resolve(params) });
      const titleText = resolveTitleText(metadata.title);
      const context = `"${routeId}" with params ${JSON.stringify(params)}`;

      expect(titleText, `${context} has no title.`).toBeTruthy();
      expect(titleText, `${context} inherited the generic layout title.`).not.toBe(genericTitle);
      expect(
        titleText?.endsWith(SITE_TITLE_SUFFIX),
        `${context} is not branded with "${SITE_TITLE_SUFFIX}".`,
      ).toBe(true);

      expect(metadata.openGraph?.title, `${context} og:title does not match <title>.`).toEqual(
        metadata.title,
      );
      expect(metadata.twitter?.title, `${context} twitter:title does not match <title>.`).toEqual(
        metadata.title,
      );
      expect(
        metadata.openGraph?.images,
        `${context} og:image is missing — a bare openGraph.title block drops it.`,
      ).toBeTruthy();
      expect(
        metadata.alternates?.canonical,
        `${context} is missing alternates.canonical.`,
      ).toBeTruthy();
    }
  });
});
