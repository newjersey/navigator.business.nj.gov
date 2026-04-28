import type { Element, Root, Text } from "hast";
import {
  createItem,
  deleteItem,
  getAllCollections,
  getAllItems,
  getCollection,
  htmlToMarkdown,
  modifyItem,
  normalizeQuotes,
  processHastNode,
} from "./methods";

jest.mock("hast-util-from-html", () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fromHtml: (_html: string, _opts: unknown): Root => ({
    type: "root",
    children: [{ type: "text", value: "parsed" }],
  }),
}));

function createMockFetchResponse<T>(data: T): Promise<Response> {
  return Promise.resolve({
    ok: true,
    status: 200,
    statusText: "OK",
    headers: new Headers(),
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response);
}

describe("methods", () => {
  const mockCollectionId = "test-collection-id";
  const mockItemId = "test-item-id";
  let mockFetch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.WEBFLOW_API_TOKEN = "test-token";
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  describe("getAllItems", () => {
    it("fetches all items with pagination", async () => {
      mockFetch.mockResolvedValueOnce(
        createMockFetchResponse({
          items: [{ id: "1", fieldData: { name: "Item 1" } }],
          pagination: { limit: 100, offset: 0, total: 2 },
        }),
      );

      mockFetch.mockResolvedValueOnce(
        createMockFetchResponse({
          items: [{ id: "2", fieldData: { name: "Item 2" } }],
          pagination: { limit: 100, offset: 1, total: 2 },
        }),
      );

      const result = await getAllItems(mockCollectionId);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("2");
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("makes single request when all items fit in one page", async () => {
      mockFetch.mockResolvedValueOnce(
        createMockFetchResponse({
          items: [{ id: "1", fieldData: { name: "Item 1" } }],
          pagination: { limit: 100, offset: 0, total: 1 },
        }),
      );

      const result = await getAllItems(mockCollectionId);

      expect(result).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("getCollection", () => {
    it("fetches collection details", async () => {
      const mockCollection = {
        id: mockCollectionId,
        displayName: "Test Collection",
        slug: "test-collection",
        fields: [],
      };

      mockFetch.mockResolvedValueOnce(createMockFetchResponse(mockCollection));

      const result = await getCollection(mockCollectionId);

      expect(result.data).toEqual(mockCollection);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.webflow.com/v2/collections/${mockCollectionId}`,
        expect.objectContaining({
          method: "GET",
        }),
      );
    });
  });

  describe("getAllCollections", () => {
    it("fetches all collections for site", async () => {
      const mockCollections = {
        collections: [
          { id: "1", displayName: "Collection 1", slug: "collection-1", fields: [] },
          { id: "2", displayName: "Collection 2", slug: "collection-2", fields: [] },
        ],
      };

      mockFetch.mockResolvedValueOnce(createMockFetchResponse(mockCollections));

      const result = await getAllCollections();

      expect(result.data.collections).toHaveLength(2);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/sites/"),
        expect.objectContaining({
          method: "GET",
        }),
      );
    });
  });

  describe("createItem", () => {
    it("creates item with default draft status", async () => {
      const mockItem = { name: "Test Item", slug: "test-item" };
      const mockResponse = { id: "new-item-id" };

      mockFetch.mockResolvedValueOnce(createMockFetchResponse(mockResponse));

      const result = await createItem(mockItem, mockCollectionId);

      expect(result.data).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/collections/${mockCollectionId}/items`),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            isArchived: false,
            isDraft: true,
            fieldData: mockItem,
          }),
        }),
      );
    });

    it("creates item with custom draft status", async () => {
      const mockItem = { name: "Test Item", slug: "test-item" };
      const mockResponse = { id: "new-item-id" };

      mockFetch.mockResolvedValueOnce(createMockFetchResponse(mockResponse));

      await createItem(mockItem, mockCollectionId, false);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/collections/${mockCollectionId}/items`),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            isArchived: false,
            isDraft: false,
            fieldData: mockItem,
          }),
        }),
      );
    });
  });

  describe("modifyItem", () => {
    it("modifies item with PATCH by default", async () => {
      const mockBody = { name: "Updated Name" };

      mockFetch.mockResolvedValueOnce(createMockFetchResponse({}));

      await modifyItem(mockItemId, mockCollectionId, mockBody);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(mockItemId),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            fieldData: mockBody,
          }),
        }),
      );
    });

    it("modifies item with custom method", async () => {
      const mockBody = { name: "Updated Name" };

      mockFetch.mockResolvedValueOnce(createMockFetchResponse({}));

      await modifyItem(mockItemId, mockCollectionId, mockBody, "put");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(mockItemId),
        expect.objectContaining({
          method: "PUT",
        }),
      );
    });
  });

  describe("deleteItem", () => {
    it("deletes item", async () => {
      mockFetch.mockResolvedValueOnce(createMockFetchResponse({}));

      await deleteItem(mockItemId, mockCollectionId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(mockItemId),
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });
  });

  describe("processHastNode", () => {
    const t = (value: string): Text => ({ type: "text", value });
    const el = (
      tagName: string,
      children: Element["children"],
      properties: Element["properties"] = {},
    ): Element => ({ type: "element", tagName, properties, children });

    it("should return text node values as-is without escaping", () => {
      expect(processHastNode(t("**bold**"))).toBe("**bold**");
    });

    it("should wrap strong in **", () => {
      expect(processHastNode(el("strong", [t("bold")]))).toBe("**bold**");
    });

    it("should wrap em in *", () => {
      expect(processHastNode(el("em", [t("italic")]))).toBe("*italic*");
    });

    it("should convert <a> to markdown link", () => {
      expect(processHastNode(el("a", [t("click here")], { href: "https://example.com" }))).toBe(
        "[click here](https://example.com)",
      );
    });

    it("should convert <br> to newline", () => {
      expect(processHastNode(el("br", []))).toBe("\n");
    });

    it("should add double newlines after <p>", () => {
      expect(processHastNode(el("p", [t("text")]))).toBe("text\n\n");
    });

    it("should convert <ul>/<li> to markdown list", () => {
      expect(processHastNode(el("ul", [el("li", [t("item")])]))).toBe("* item\n\n");
    });

    it("should convert heading tags to markdown headings", () => {
      expect(processHastNode(el("h2", [t("Title")]))).toBe("## Title\n\n");
    });

    it("should join root children", () => {
      const root: Root = { type: "root", children: [t("a"), t("b")] };
      expect(processHastNode(root)).toBe("ab");
    });
  });

  describe("htmlToMarkdown", () => {
    it("should call fromHtml and process the result", () => {
      const result = htmlToMarkdown("<p>hello</p>");
      expect(result).toBe("parsed");
    });
  });

  describe("normalizeQuotes", () => {
    it("should replace curly single quotes with straight apostrophes", () => {
      expect(normalizeQuotes("you\u2018ve decided")).toBe("you've decided");
      expect(normalizeQuotes("it\u2019s time")).toBe("it's time");
    });

    it("should replace curly double quotes with straight double quotes", () => {
      expect(normalizeQuotes("\u201Chello\u201D")).toBe('"hello"');
    });

    it("should leave text without smart quotes unchanged", () => {
      expect(normalizeQuotes("plain text")).toBe("plain text");
    });
  });
});
