import { afterEach, describe, expect, it } from "vitest";
import { sendSearchPerformedEvent, sendSearchResultClickedEvent } from "./searchAnalytics";

describe("sendSearchPerformedEvent", () => {
  afterEach(() => {
    window.dataLayer = undefined;
  });

  it("pushes a search_performed event with the query, result count, and locale", () => {
    sendSearchPerformedEvent({ query: "funding", resultCount: 12, locale: "en-US" });

    expect(window.dataLayer).toEqual([
      { event: "search_performed", query: "funding", resultCount: 12, locale: "en-US" },
    ]);
  });

  it("initializes dataLayer when it does not already exist", () => {
    window.dataLayer = undefined;

    sendSearchPerformedEvent({ query: "licensing", resultCount: 0, locale: "es-US" });

    expect(window.dataLayer).toEqual([
      { event: "search_performed", query: "licensing", resultCount: 0, locale: "es-US" },
    ]);
  });

  it("appends to an existing dataLayer without clearing prior entries", () => {
    window.dataLayer = [{ event: "gtm.js" }];

    sendSearchPerformedEvent({ query: "funding", resultCount: 3, locale: "en-US" });

    expect(window.dataLayer).toEqual([
      { event: "gtm.js" },
      { event: "search_performed", query: "funding", resultCount: 3, locale: "en-US" },
    ]);
  });
});

describe("sendSearchResultClickedEvent", () => {
  afterEach(() => {
    window.dataLayer = undefined;
  });

  it("pushes a search_result_clicked event with the query, content type, and locale", () => {
    sendSearchResultClickedEvent({ query: "funding", contentType: "Learn page", locale: "en-US" });

    expect(window.dataLayer).toEqual([
      {
        event: "search_result_clicked",
        query: "funding",
        contentType: "Learn page",
        locale: "en-US",
      },
    ]);
  });

  it("reports the Update content type for an Update result", () => {
    sendSearchResultClickedEvent({ query: "grants", contentType: "Update", locale: "es-US" });

    expect(window.dataLayer).toEqual([
      { event: "search_result_clicked", query: "grants", contentType: "Update", locale: "es-US" },
    ]);
  });
});
