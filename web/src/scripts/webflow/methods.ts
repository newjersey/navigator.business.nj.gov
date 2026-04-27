import type { Element, Node, Root, Text } from "hast";
import { fromHtml } from "hast-util-from-html";
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

interface WebflowErrorResponse {
  message: string;
  code: string;
  externalReference: string | null;
  details: unknown[];
}

/**
 * Checks HTTP response status and parses JSON. Throws an error if response is not ok.
 * @returns Parsed JSON data
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  const text = await response.text();

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    if (text) {
      try {
        const errorData = JSON.parse(text) as WebflowErrorResponse;
        errorMessage = `${errorMessage} - ${errorData.message} (${errorData.code})`;
      } catch {
        errorMessage = `${errorMessage} - ${text}`;
      }
    }

    const error = new Error(errorMessage) as Error & { response?: { status: number } };
    error.response = { status: response.status };
    throw error;
  }

  // For successful responses, parse JSON if there's content
  if (text) {
    return JSON.parse(text) as T;
  }

  // Return empty object for empty successful responses (like 204 No Content)
  return {} as T;
};

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
    const data = await handleResponse<WebflowItemsResponse<T>>(response);
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
  const data = await handleResponse<WebflowCollection>(response);
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
  const data = await handleResponse<{ collections: WebflowCollection[] }>(response);
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
  const data = await handleResponse<WebflowCreateItemResponse>(response);
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
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({
        fieldData: {
          ...body,
        },
      }),
    },
  );
  const data = await handleResponse<unknown>(response);
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
  const data = await handleResponse<unknown>(response);
  return {
    data,
    headers: response.headers,
  };
};

const normalizeQuotes = (text: string): string => {
  return text.replaceAll(/[\u2018\u2019]/g, "'").replaceAll(/[\u201C\u201D]/g, '"');
};

// Used to get more consistent output to match what we expect from Decap
const processHastNode = (node: Node): string => {
  if (node.type === "text") return (node as Text).value;

  if (node.type === "root") return (node as Root).children.map(processHastNode).join("");

  if (node.type === "element") {
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const children = el.children.map(processHastNode).join("");

    switch (tag) {
      case "p":
        return `${children}\n\n`;
      case "br":
        return "\n";
      case "strong":
      case "b":
        return `**${children}**`;
      case "em":
      case "i":
        return `*${children}*`;
      case "a":
        return `[${children}](${(el.properties?.href as string) ?? ""})`;
      case "ul":
      case "ol":
        return `${children}\n`;
      case "li":
        return `* ${children.trim()}\n`;
      case "h1":
        return `# ${children}\n\n`;
      case "h2":
        return `## ${children}\n\n`;
      case "h3":
        return `### ${children}\n\n`;
      case "h4":
        return `#### ${children}\n\n`;
      case "h5":
        return `##### ${children}\n\n`;
      case "h6":
        return `###### ${children}\n\n`;
      default:
        return children;
    }
  }

  return "";
};

const htmlToMarkdown = (html: string): string =>
  processHastNode(fromHtml(html, { fragment: true }))
    .replaceAll(/\n{3,}/g, "\n\n")
    .trim();

export {
  createItem,
  deleteItem,
  getAllCollections,
  getAllItems,
  getCollection,
  htmlToMarkdown,
  modifyItem,
  normalizeQuotes,
  processHastNode,
};
