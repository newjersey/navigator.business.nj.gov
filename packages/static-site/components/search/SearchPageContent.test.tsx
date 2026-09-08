import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocale } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  sendSearchPerformedEvent,
  sendSearchResultClickedEvent,
} from "@/domain/analytics/searchAnalytics";
import { getApplicationMessages } from "@/domain/i18n/messages";
import {
  loadPagefindRuntime,
  type PagefindResult,
  type PagefindResultData,
} from "@/domain/search/pagefindRuntime";
import { SearchPageContent } from "./SearchPageContent";

vi.mock("@/domain/search/pagefindRuntime", () => ({
  loadPagefindRuntime: vi.fn(),
}));

vi.mock("@/domain/analytics/searchAnalytics", () => ({
  sendSearchPerformedEvent: vi.fn(),
  sendSearchResultClickedEvent: vi.fn(),
}));

vi.mock("next-intl", () => ({ useLocale: vi.fn() }));

const mockedLoadPagefindRuntime = vi.mocked(loadPagefindRuntime);
const mockedSendSearchPerformedEvent = vi.mocked(sendSearchPerformedEvent);
const mockedSendSearchResultClickedEvent = vi.mocked(sendSearchResultClickedEvent);
const mockedUseLocale = vi.mocked(useLocale);

mockedUseLocale.mockReturnValue("en-US");

afterEach(() => {
  vi.clearAllMocks();
  mockedUseLocale.mockReturnValue("en-US");
});

const messages = getApplicationMessages({ locale: "en-US" }).search;

const makeResult = (data: PagefindResultData): PagefindResult => ({
  id: data.url,
  data: () => Promise.resolve(data),
});

const learnPageData: PagefindResultData = {
  url: "/pages/example-learn-page",
  excerpt: "An example <mark>funding</mark> excerpt.",
  meta: { title: "Example Learn Page" },
  filters: { type: ["Learn page"] },
};

const updateData: PagefindResultData = {
  url: "/updates/example-update",
  excerpt: "An example update about <mark>funding</mark>.",
  meta: { title: "Example Update" },
  filters: { type: ["Update"] },
};

const fundingData: PagefindResultData = {
  url: "/pages/funding",
  excerpt: "An example <mark>funding</mark> program excerpt.",
  meta: { title: "Example Funding Program" },
  filters: { type: ["Funding program"] },
};

// Pagefind's crawl fetches locale-prefixed paths directly, so `data.url` for
// a non-default-locale result already includes that prefix (see
// `scripts/buildPagefindIndex.ts`). This fixture exists specifically to
// protect the `stripLocalePrefix()` call in `ResultCard`: `vitest.setup.ts`'s
// mocked `Link` passes `href` straight through with no re-prefixing logic of
// its own, so if `stripLocalePrefix()` were ever removed, this result's
// rendered `href` would regress to the still-prefixed `data.url` value
// instead of the stripped one asserted below.
const esLocaleUpdateData: PagefindResultData = {
  url: "/es-US/updates/example-update-es",
  excerpt: "Un ejemplo de actualización sobre <mark>financiamiento</mark>.",
  meta: { title: "Ejemplo de Actualización" },
  filters: { type: ["Update"] },
};

/**
 * Stubs `loadPagefindRuntime()` with a runtime whose `search()` always
 * resolves to the given results, regardless of query/filters.
 */
const stubPagefindResults = (results: readonly PagefindResultData[]): ReturnType<typeof vi.fn> => {
  const search = vi.fn().mockResolvedValue({ results: results.map(makeResult) });
  mockedLoadPagefindRuntime.mockResolvedValue({ search });
  return search;
};

describe("SearchPageContent with no query", () => {
  it("prompts for a search term instead of running a search", () => {
    render(<SearchPageContent initialQuery="" messages={messages} />);

    expect(screen.getByRole("heading", { level: 1, name: messages.title })).toBeInTheDocument();
    expect(screen.getByText(messages.noQueryBody)).toBeInTheDocument();
    expect(mockedLoadPagefindRuntime).not.toHaveBeenCalled();
  });
});

describe("SearchPageContent loading state", () => {
  it("shows a loading message while the search is in flight", () => {
    mockedLoadPagefindRuntime.mockReturnValue(new Promise(() => {}));

    render(<SearchPageContent initialQuery="funding" messages={messages} />);

    expect(screen.getByText(messages.loadingLabel)).toBeInTheDocument();
  });
});

describe("SearchPageContent rendering results", () => {
  it("renders a linked result for a Learn page match", async () => {
    stubPagefindResults([learnPageData]);

    render(<SearchPageContent initialQuery="funding" messages={messages} />);

    const heading = await screen.findByRole("heading", { level: 3, name: "Example Learn Page" });
    const link = within(heading).getByRole("link", { name: "Example Learn Page" });
    expect(link).toHaveAttribute("href", "/pages/example-learn-page");

    const card = heading.closest(".usa-card__container");
    expect(card).not.toBeNull();
    expect(
      within(card as HTMLElement).getByText(messages.typeLabels["Learn page"]),
    ).toBeInTheDocument();
  });

  it("renders a linked result for an Update match", async () => {
    stubPagefindResults([updateData]);

    render(<SearchPageContent initialQuery="funding" messages={messages} />);

    const heading = await screen.findByRole("heading", { level: 3, name: "Example Update" });
    expect(within(heading).getByRole("link")).toHaveAttribute("href", "/updates/example-update");
  });

  it("strips a result's existing locale prefix before handing its URL to Link, so it isn't re-prefixed", async () => {
    mockedUseLocale.mockReturnValue("es-US");
    stubPagefindResults([esLocaleUpdateData]);

    render(<SearchPageContent initialQuery="financiamiento" messages={messages} />);

    const heading = await screen.findByRole("heading", {
      level: 3,
      name: "Ejemplo de Actualización",
    });
    // Asserts the stripped pathname, not the original `/es-US/updates/...`
    // value `data.url` already carried — a regression that removed
    // `stripLocalePrefix()` would leave the prefix in place here.
    expect(within(heading).getByRole("link")).toHaveAttribute("href", "/updates/example-update-es");
  });

  it("renders the result count", async () => {
    stubPagefindResults([learnPageData, updateData]);

    render(<SearchPageContent initialQuery="funding" messages={messages} />);

    await screen.findByRole("heading", { level: 3, name: "Example Learn Page" });
    expect(screen.getByText(/Showing/).closest("p")).toHaveTextContent("Showing 1–2 of 2 results");
  });

  it("passes the query from the URL into the search call", async () => {
    const search = stubPagefindResults([learnPageData]);

    render(<SearchPageContent initialQuery="  funding  " messages={messages} />);

    await screen.findByRole("heading", { level: 3, name: "Example Learn Page" });
    expect(search).toHaveBeenCalledWith("funding", undefined);
  });

  it("sends a search_performed analytics event with the query, result count, and locale", async () => {
    stubPagefindResults([learnPageData, updateData]);

    render(<SearchPageContent initialQuery="funding" messages={messages} />);

    await screen.findByRole("heading", { level: 3, name: "Example Learn Page" });
    await waitFor(() => {
      expect(mockedSendSearchPerformedEvent).toHaveBeenCalledWith({
        query: "funding",
        resultCount: 2,
        locale: "en-US",
      });
    });
  });

  it("sends the search_performed event with the locale active when the search ran", async () => {
    mockedUseLocale.mockReturnValue("es-US");
    stubPagefindResults([learnPageData]);

    render(<SearchPageContent initialQuery="funding" messages={messages} />);

    await screen.findByRole("heading", { level: 3, name: "Example Learn Page" });
    await waitFor(() => {
      expect(mockedSendSearchPerformedEvent).toHaveBeenCalledWith(
        expect.objectContaining({ locale: "es-US" }),
      );
    });
  });
});

describe("SearchPageContent result-click analytics", () => {
  it("sends a search_result_clicked event when a Learn page result link is clicked", async () => {
    const user = userEvent.setup();
    stubPagefindResults([learnPageData]);

    render(<SearchPageContent initialQuery="funding" messages={messages} />);

    const heading = await screen.findByRole("heading", { level: 3, name: "Example Learn Page" });
    await user.click(within(heading).getByRole("link"));

    expect(mockedSendSearchResultClickedEvent).toHaveBeenCalledWith({
      query: "funding",
      contentType: "Learn page",
      locale: "en-US",
    });
  });

  it("sends a search_result_clicked event when an Update result link is clicked", async () => {
    const user = userEvent.setup();
    stubPagefindResults([updateData]);

    render(<SearchPageContent initialQuery="funding" messages={messages} />);

    const heading = await screen.findByRole("heading", { level: 3, name: "Example Update" });
    await user.click(within(heading).getByRole("link"));

    expect(mockedSendSearchResultClickedEvent).toHaveBeenCalledWith({
      query: "funding",
      contentType: "Update",
      locale: "en-US",
    });
  });
});

describe("SearchPageContent Funding-program results", () => {
  it("renders a Funding-program result without a link, with an explanatory note and a general CTA", async () => {
    stubPagefindResults([fundingData]);

    render(<SearchPageContent initialQuery="funding" messages={messages} />);

    const heading = await screen.findByRole("heading", {
      level: 3,
      name: "Example Funding Program",
    });
    expect(within(heading).queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText(messages.fundingResultNote)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: messages.fundingResultCtaLabel })).toHaveAttribute(
      "href",
      "/pages/funding",
    );
    // No link exists inside the result heading itself (asserted above), so
    // there is nothing there a visitor could click to fire the event.
    expect(mockedSendSearchResultClickedEvent).not.toHaveBeenCalled();
  });
});

describe("SearchPageContent zero-result state", () => {
  it("shows the zero-result message when the search matches nothing", async () => {
    stubPagefindResults([]);

    render(<SearchPageContent initialQuery="nonexistent" messages={messages} />);

    expect(await screen.findByText(messages.zeroResultsTitle)).toBeInTheDocument();
    expect(screen.getByText(messages.zeroResultsBody)).toBeInTheDocument();
  });
});

describe("SearchPageContent error state", () => {
  it("shows an error message when the search runtime fails to load", async () => {
    mockedLoadPagefindRuntime.mockRejectedValue(new Error("network error"));

    render(<SearchPageContent initialQuery="funding" messages={messages} />);

    expect(await screen.findByText(messages.errorMessage)).toBeInTheDocument();
  });
});

const facetToggleSendsASecondSearchPerformedEvent = async (): Promise<void> => {
  const user = userEvent.setup();
  // The initial, unfiltered search resolves with both results; toggling
  // the "Learn page" facet re-runs the search and this second call
  // resolves with only the narrowed result — exercising the map decision
  // (see useSearchResults's doc comment) that a facet-triggered re-search
  // fires its own search_performed event, not just the initial one.
  const search = vi
    .fn()
    .mockResolvedValueOnce({ results: [learnPageData, updateData].map(makeResult) })
    .mockResolvedValueOnce({ results: [learnPageData].map(makeResult) });
  mockedLoadPagefindRuntime.mockResolvedValue({ search });

  render(<SearchPageContent initialQuery="funding" messages={messages} />);

  await screen.findByRole("heading", { level: 3, name: "Example Learn Page" });
  await waitFor(() => {
    expect(mockedSendSearchPerformedEvent).toHaveBeenCalledWith({
      query: "funding",
      resultCount: 2,
      locale: "en-US",
    });
  });

  await user.click(screen.getByLabelText(messages.typeLabels["Learn page"]));

  await waitFor(() => {
    expect(mockedSendSearchPerformedEvent).toHaveBeenCalledWith({
      query: "funding",
      resultCount: 1,
      locale: "en-US",
    });
  });
  expect(mockedSendSearchPerformedEvent).toHaveBeenCalledTimes(2);
};

describe("SearchPageContent facet filtering", () => {
  it("shows a checkbox for every known content type", async () => {
    stubPagefindResults([learnPageData]);

    render(<SearchPageContent initialQuery="funding" messages={messages} />);

    await screen.findByRole("heading", { level: 3, name: "Example Learn Page" });
    expect(screen.getByLabelText(messages.typeLabels["Learn page"])).toBeInTheDocument();
    expect(screen.getByLabelText(messages.typeLabels.Update)).toBeInTheDocument();
    expect(screen.getByLabelText(messages.typeLabels["Funding program"])).toBeInTheDocument();
  });

  it("re-runs the search with a type filter when a facet is toggled", async () => {
    const user = userEvent.setup();
    const search = stubPagefindResults([learnPageData]);

    render(<SearchPageContent initialQuery="funding" messages={messages} />);

    await screen.findByRole("heading", { level: 3, name: "Example Learn Page" });
    await user.click(screen.getByLabelText(messages.typeLabels["Learn page"]));

    await waitFor(() => {
      expect(search).toHaveBeenLastCalledWith("funding", { filters: { type: "Learn page" } });
    });
  });

  it(
    "sends a second search_performed event, with the narrowed count, when a facet is toggled",
    facetToggleSendsASecondSearchPerformedEvent,
  );

  it("ORs multiple selected facets together instead of ANDing them", async () => {
    const user = userEvent.setup();
    const search = stubPagefindResults([learnPageData, updateData]);

    render(<SearchPageContent initialQuery="funding" messages={messages} />);

    await screen.findByRole("heading", { level: 3, name: "Example Learn Page" });
    await user.click(screen.getByLabelText(messages.typeLabels["Learn page"]));
    await user.click(screen.getByLabelText(messages.typeLabels.Update));

    await waitFor(() => {
      expect(search).toHaveBeenLastCalledWith("funding", {
        filters: { type: { any: ["Learn page", "Update"] } },
      });
    });
  });

  it("shows a removable chip for each active facet, and Reset clears them all", async () => {
    const user = userEvent.setup();
    stubPagefindResults([learnPageData]);

    render(<SearchPageContent initialQuery="funding" messages={messages} />);

    await screen.findByRole("heading", { level: 3, name: "Example Learn Page" });
    expect(screen.queryByText(messages.filteringByLabel)).not.toBeInTheDocument();

    await user.click(screen.getByLabelText(messages.typeLabels["Learn page"]));
    expect(screen.getByText(messages.filteringByLabel)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: messages.filterReset }));
    expect(screen.queryByText(messages.filteringByLabel)).not.toBeInTheDocument();
    expect(
      (screen.getByLabelText(messages.typeLabels["Learn page"]) as HTMLInputElement).checked,
    ).toBe(false);
  });
});
