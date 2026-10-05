import type { ContentDeadLink } from "@/lib/static/admin/findDeadLinks";

/** Inputs for exporting completed scan findings as a spreadsheet-friendly CSV. */
export interface DeadLinksCsvOptions {
  readonly results: readonly ContentDeadLink[];
  /** Origin that relative page and CMS links are resolved against, e.g. `https://example.gov`. */
  readonly siteOrigin: string;
}

const UTF8_BYTE_ORDER_MARK = "\uFEFF";
const RECORD_SEPARATOR = "\r\n";
const CONTENT_SOURCE_DIRECTORY = "content/src/";

const COLUMN_HEADERS = [
  "Collection",
  "Content name",
  "Slug",
  "File path",
  "Page URL",
  "CMS edit URL",
  "Dead URL",
  "Field",
  "HTTP status code",
  "Status text",
  "Context",
];

const quoteCell = (value: string): string => `"${value.replaceAll('"', '""')}"`;

const toRecord = (cells: readonly string[]): string => cells.map(quoteCell).join(",");

const toRepositoryPath = (filePath: string): string => {
  const sourceIndex = filePath.lastIndexOf(CONTENT_SOURCE_DIRECTORY);
  return sourceIndex === -1 ? filePath : filePath.slice(sourceIndex);
};

const toAbsoluteUrl = (relativeUrl: string, siteOrigin: string): string =>
  relativeUrl === "" ? "" : new URL(relativeUrl, siteOrigin).href;

/**
 * Builds a CSV with one record per dead URL. The content item's details are repeated on every
 * record so the rows stay meaningful after being sorted, filtered, or divided among people.
 * Every cell is quoted and no value is altered, so spreadsheet apps import the data as written.
 */
export const generateDeadLinksCsv = ({ results, siteOrigin }: DeadLinksCsvOptions): string => {
  const records = results.flatMap((item) =>
    item.deadUrls.map((deadUrl) =>
      toRecord([
        item.collection,
        item.displayName,
        item.slug,
        toRepositoryPath(item.file),
        toAbsoluteUrl(item.pageUrl, siteOrigin),
        toAbsoluteUrl(item.cmsEditUrl, siteOrigin),
        deadUrl.url,
        deadUrl.field,
        deadUrl.statusCode?.toString() ?? "",
        deadUrl.statusText ?? "",
        deadUrl.context,
      ]),
    ),
  );

  return UTF8_BYTE_ORDER_MARK + [toRecord(COLUMN_HEADERS), ...records].join(RECORD_SEPARATOR);
};
