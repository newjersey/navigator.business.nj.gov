import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getAllStarterKitUrls } from "@/lib/utils/starterKits";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));

// Always the production hostname, regardless of which stage builds this file. Non-prod
// hostnames (dev/testing/staging) are gated behind Basic Auth and must never be published in a
// sitemap for search engines to index.
const PRODUCTION_BASE_URL = "https://account.business.nj.gov";

const generateSitemap = async (): Promise<void> => {
  const urls = [{ loc: "/", changefreq: "monthly", priority: "1.0" }];

  for (const pathObject of getAllStarterKitUrls()) {
    urls.push({
      loc: `/starter-kits/${pathObject.params.starterKitsUrl}`,
      changefreq: "monthly",
      priority: "1.0",
    });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
    ${urls
      .map(
        (url) => `
      <url>
        <loc>${`${PRODUCTION_BASE_URL}${url.loc}`}</loc>
        <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
      </url>`,
      )
      .join("")}
  </urlset>`;

  await fs.writeFile(path.join(SCRIPT_DIRECTORY, "..", "..", "public", "sitemap.xml"), sitemap);
};

try {
  await generateSitemap();
} catch (error: unknown) {
  console.error("Failed to generate sitemap.xml", error);
  process.exitCode = 1;
}
