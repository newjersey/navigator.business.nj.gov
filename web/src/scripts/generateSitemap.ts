import fs from "node:fs/promises";
import path from "node:path";

import { getAllStarterKitUrls } from "@/lib/utils/starterKits";

const generateSitemap = (): void => {
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
        <loc>${`https://navigator.business.nj.gov${url.loc}`}</loc>
        <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
      </url>`
      )
      .join("")}
  </urlset>`;

  fs.writeFile(path.join(__dirname, "..", "..", "public", "sitemap.xml"), sitemap);
};

generateSitemap();
