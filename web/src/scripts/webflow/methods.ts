import { checkRateLimitAndWait } from "./helpers";
import {
  FetchResponse,
  WebflowCollection,
  WebflowCreateItemResponse,
  WebflowItem,
  WebflowItemsResponse,
} from "./types";
import { siteId } from "./webflowIds";

if (process.env.WEBFLOW_API_TOKEN === undefined) {
  throw new Error("No Webflow API Token in Env");
}

const headers = { Authorization: `Bearer ${process.env.WEBFLOW_API_TOKEN}` };

const getAllItems = async <T = Record<string, unknown>>(
  collectionId: string,
): Promise<WebflowItem<T>[]> => {
  let responseItems: WebflowItem<T>[] = [];
  let totalToFetch = 1;

  while (responseItems.length < totalToFetch) {
    const response = await fetch(
      `https://api.webflow.com/v2/collections/${collectionId}/items?offset=${responseItems.length}`,
      {
        method: "GET",
        headers,
      },
    );
    const data = await response.json() as WebflowItemsResponse<T>;
    const fetchResponse: FetchResponse<WebflowItemsResponse<T>> = {
      data,
      headers: response.headers,
    };
    responseItems = [...responseItems, ...data.items];
    totalToFetch = data.pagination.total;
    await checkRateLimitAndWait(fetchResponse);
  }

  return responseItems;
};

const getCollection = async (collectionId: string): Promise<FetchResponse<WebflowCollection>> => {
  const response = await fetch(`https://api.webflow.com/v2/collections/${collectionId}`, {
    method: "GET",
    headers,
  });
  const data = await response.json() as WebflowCollection;
  return {
    data,
    headers: response.headers,
  };
};

const getAllCollections = async (): Promise<
  FetchResponse<{ collections: WebflowCollection[] }>
> => {
  const response = await fetch(`https://api.webflow.com/v2/sites/${siteId}/collections`, {
    method: "GET",
    headers,
  });
  const data = await response.json() as { collections: WebflowCollection[] };
  return {
    data,
    headers: response.headers,
  };
};

const createItem = async (
  item: Record<string, unknown>,
  collectionId: string,
  isDraft: boolean = true,
): Promise<FetchResponse<WebflowCreateItemResponse>> => {
  const response = await fetch(`https://api.webflow.com/v2/collections/${collectionId}/items`, {
    method: "POST",
    headers: { ...headers, "content-type": "application/json" },
    body: JSON.stringify({
      isArchived: false,
      isDraft,
      fieldData: {
        ...item,
      },
    }),
  });
  const data = await response.json() as WebflowCreateItemResponse;
  return {
    data,
    headers: response.headers,
  };
};

const modifyItem = async (
  itemId: string,
  collectionId: string,
  body: Record<string, unknown>,
  method: "patch" | "put" = "patch",
): Promise<FetchResponse> => {
  const response = await fetch(
    `https://api.webflow.com/v2/collections/${collectionId}/items/${itemId}`,
    {
      method: method.toUpperCase(),
      headers,
      body: JSON.stringify({
        fieldData: {
          ...body,
        },
      }),
    },
  );
  const data = await response.json();
  return {
    data,
    headers: response.headers,
  };
};

const deleteItem = async (itemId: string, collectionId: string): Promise<FetchResponse> => {
  const response = await fetch(
    `https://api.webflow.com/v2/collections/${collectionId}/items/${itemId}`,
    {
      method: "DELETE",
      headers,
    },
  );
  const data = await response.json();
  return {
    data,
    headers: response.headers,
  };
};

export { createItem, deleteItem, getAllCollections, getAllItems, getCollection, modifyItem };
