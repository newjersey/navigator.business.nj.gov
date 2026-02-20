// Mock fetch at the module level before any imports
global.fetch = jest.fn();

import {
  createItem,
  deleteItem,
  getAllCollections,
  getAllItems,
  getCollection,
  modifyItem,
} from "./methods.ts";

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Helper to create properly typed Response mocks
function createMockResponse<T>(data: T): Response {
  return {
    json: async () => data,
    headers: new Headers(),
    ok: true,
    redirected: false,
    status: 200,
    statusText: "OK",
    type: "basic",
    url: "",
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    text: async () => JSON.stringify(data),
    clone: function() { return this; },
  } as Response;
}

describe("methods", () => {
  const mockCollectionId = "test-collection-id";
  const mockItemId = "test-item-id";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.WEBFLOW_API_TOKEN = "test-token";
  });

  describe("getAllItems", () => {
    it("fetches all items with pagination", async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({
        items: [{ id: "1", fieldData: { name: "Item 1" } }],
        pagination: { limit: 100, offset: 0, total: 2 },
      }));

      mockFetch.mockResolvedValueOnce(createMockResponse({
        items: [{ id: "2", fieldData: { name: "Item 2" } }],
        pagination: { limit: 100, offset: 1, total: 2 },
      }));

      const result = await getAllItems(mockCollectionId);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("2");
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("makes single request when all items fit in one page", async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({
        items: [{ id: "1", fieldData: { name: "Item 1" } }],
        pagination: { limit: 100, offset: 0, total: 1 },
      }));

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

      mockFetch.mockResolvedValueOnce(createMockResponse(mockCollection));

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

      mockFetch.mockResolvedValueOnce(createMockResponse(mockCollections));

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

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await createItem(mockItem, mockCollectionId);

      expect(result.data).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
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

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      await createItem(mockItem, mockCollectionId, false);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
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

      mockFetch.mockResolvedValueOnce(createMockResponse({}));

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

      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await modifyItem(mockItemId, mockCollectionId, mockBody, "put");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "PUT",
        }),
      );
    });
  });

  describe("deleteItem", () => {
    it("deletes item", async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await deleteItem(mockItemId, mockCollectionId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(mockItemId),
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });
  });
});
