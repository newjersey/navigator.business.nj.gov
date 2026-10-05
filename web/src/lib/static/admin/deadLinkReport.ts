import { ContentDeadLink, FoundUrl, LinkCategory } from "@/lib/static/admin/findDeadLinks";

export const REPORT_BASE_URL = "https://dev.account.business.nj.gov";

export const LINK_CATEGORY_LABELS: Record<LinkCategory, string> = {
  dead: "Dead",
  httpsOnly: "Works over https only",
  serverError: "Server error",
  inconclusive: "Inconclusive",
};

export const formatLinkStatus = (foundUrl: FoundUrl): string =>
  foundUrl.statusCode
    ? `${foundUrl.statusCode} ${foundUrl.statusText}`
    : foundUrl.statusText || "Connection Failed";

export const countByCategory = (results: ContentDeadLink[]): Record<LinkCategory, number> => {
  const counts: Record<LinkCategory, number> = {
    dead: 0,
    httpsOnly: 0,
    serverError: 0,
    inconclusive: 0,
  };
  for (const foundUrl of results.flatMap((item) => item.deadUrls)) {
    if (foundUrl.category) counts[foundUrl.category]++;
  }
  return counts;
};

export const formatCategorySummary = (results: ContentDeadLink[]): string => {
  const counts = countByCategory(results);
  return (Object.keys(LINK_CATEGORY_LABELS) as LinkCategory[])
    .map((category) => `${LINK_CATEGORY_LABELS[category]}: ${counts[category]}`)
    .join(" · ");
};

const CSV_HEADERS = [
  "Category",
  "Collection",
  "Content Item",
  "Slug",
  "URL",
  "Status",
  "Field",
  "Context",
  "CMS Edit URL",
  "Page URL",
];

const toCsvField = (value: string): string => `"${value.replaceAll('"', '""')}"`;

const toAbsoluteUrl = (path: string): string => (path ? `${REPORT_BASE_URL}${path}` : "");

// The byte order mark makes Excel read the file as UTF-8 instead of mangling characters like →.
export const generateDeadLinksCsv = (results: ContentDeadLink[]): string => {
  const rows = results.flatMap((item) =>
    item.deadUrls.map((foundUrl) => [
      foundUrl.category ? LINK_CATEGORY_LABELS[foundUrl.category] : "",
      item.collection,
      item.displayName,
      item.slug,
      foundUrl.url,
      formatLinkStatus(foundUrl),
      foundUrl.field,
      foundUrl.context,
      toAbsoluteUrl(item.cmsEditUrl),
      toAbsoluteUrl(item.pageUrl),
    ]),
  );
  const lines = [CSV_HEADERS, ...rows].map((row) => row.map(toCsvField).join(","));
  return `\uFEFF${lines.join("\r\n")}`;
};
