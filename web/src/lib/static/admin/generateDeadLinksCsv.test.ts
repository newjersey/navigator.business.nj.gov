import type { ContentDeadLink, FoundUrl } from "@/lib/static/admin/findDeadLinks";
import { generateDeadLinksCsv } from "@/lib/static/admin/generateDeadLinksCsv";

const siteOrigin = "https://example.test";

const HEADER =
  '"Collection","Content name","Slug","File path","Page URL","CMS edit URL","Dead URL","Field","HTTP status code","Status text","Attempt count","Final URL","Redirect chain","Context"';

const generateDeadUrl = (overrides: Partial<FoundUrl>): FoundUrl => ({
  url: "https://dead.example.com",
  field: "body",
  context: "see the dead link",
  statusCode: 404,
  statusText: "Not Found",
  ...overrides,
});

const generateDeadLink = (overrides: Partial<ContentDeadLink>): ContentDeadLink => ({
  file: "/repo/content/src/roadmaps/tasks/register-llc.md",
  slug: "register-llc",
  displayName: "Register LLC",
  collection: "Tasks - All",
  cmsEditUrl: "/mgmt/cms#/collections/tasks/entries/register-llc",
  pageUrl: "/tasks/register-llc",
  deadUrls: [generateDeadUrl({})],
  ...overrides,
});

const generateCsv = (results: ContentDeadLink[]): string[] =>
  generateDeadLinksCsv({ results, siteOrigin }).replace("\uFEFF", "").split("\r\n");

describe("generateDeadLinksCsv", () => {
  it("produces only the header row when there are no findings", () => {
    expect(generateCsv([])).toEqual([HEADER]);
  });

  it("starts with a UTF-8 byte order mark so desktop spreadsheet apps detect the encoding", () => {
    expect(generateDeadLinksCsv({ results: [], siteOrigin }).startsWith("\uFEFF")).toBe(true);
  });

  it("writes one row per dead URL, repeating the content item details on each row", () => {
    const results = [
      generateDeadLink({
        deadUrls: [
          generateDeadUrl({ url: "https://one.example.com", context: "first" }),
          generateDeadUrl({ url: "https://two.example.com", context: "second", field: "summary" }),
        ],
      }),
    ];

    expect(generateCsv(results)).toEqual([
      HEADER,
      '"Tasks - All","Register LLC","register-llc","content/src/roadmaps/tasks/register-llc.md","https://example.test/tasks/register-llc","https://example.test/mgmt/cms#/collections/tasks/entries/register-llc","https://one.example.com","body","404","Not Found","","","","first"',
      '"Tasks - All","Register LLC","register-llc","content/src/roadmaps/tasks/register-llc.md","https://example.test/tasks/register-llc","https://example.test/mgmt/cms#/collections/tasks/entries/register-llc","https://two.example.com","summary","404","Not Found","","","","second"',
    ]);
  });

  it("lists a dead URL once for every content item that contains it", () => {
    const sharedUrl = "https://shared.example.com";
    const results = [
      generateDeadLink({
        slug: "a",
        file: "/repo/content/src/roadmaps/tasks/a.md",
        deadUrls: [generateDeadUrl({ url: sharedUrl })],
      }),
      generateDeadLink({
        slug: "b",
        file: "/repo/content/src/roadmaps/tasks/b.md",
        deadUrls: [generateDeadUrl({ url: sharedUrl })],
      }),
    ];

    const rows = generateCsv(results).slice(1);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toContain('"a","content/src/roadmaps/tasks/a.md"');
    expect(rows[1]).toContain('"b","content/src/roadmaps/tasks/b.md"');
  });

  it("preserves context containing quotes, commas, line breaks, and Unicode", () => {
    const context = 'Select "Apply", then\ncontinue — café ✓';
    const results = [generateDeadLink({ deadUrls: [generateDeadUrl({ context })] })];

    const csv = generateDeadLinksCsv({ results, siteOrigin });

    expect(csv.endsWith('"Select ""Apply"", then\ncontinue — café ✓"')).toBe(true);
  });

  it("keeps a file path that is outside the content directory unchanged", () => {
    const results = [generateDeadLink({ file: "/somewhere/else/page.md" })];

    expect(generateCsv(results)[1]).toContain('"/somewhere/else/page.md"');
  });

  it("leaves link cells empty when the content item has no page or CMS entry", () => {
    const results = [generateDeadLink({ pageUrl: "", cmsEditUrl: "" })];

    expect(generateCsv(results)[1]).toContain(
      '"content/src/roadmaps/tasks/register-llc.md","","",',
    );
  });

  it("leaves the HTTP status code empty when the connection failed", () => {
    const deadUrl = generateDeadUrl({ statusCode: null, statusText: "Timeout" });
    const results = [generateDeadLink({ deadUrls: [deadUrl] })];

    expect(generateCsv(results)[1]).toContain('"body","","Timeout",');
  });

  it("writes the attempt count, final URL, and redirect chain for a rate-limited redirect", () => {
    const deadUrl = generateDeadUrl({
      url: "http://njeda.gov/example/",
      statusCode: 429,
      statusText: "Too Many Requests — failed after 3 attempts",
      attemptCount: 3,
      finalUrl: "https://www.njeda.gov/example/",
      redirects: [
        {
          fromUrl: "http://njeda.gov/example/",
          statusCode: 301,
          toUrl: "https://www.njeda.gov/example/",
        },
      ],
    });
    const results = [generateDeadLink({ deadUrls: [deadUrl] })];

    expect(generateCsv(results)[1]).toContain(
      '"429","Too Many Requests — failed after 3 attempts","3","https://www.njeda.gov/example/","301: http://njeda.gov/example/ → https://www.njeda.gov/example/",',
    );
  });
});
