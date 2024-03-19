import axios from "axios";
import adapter from "axios/lib/adapters/http.js";

if (typeof process !== "undefined") {
  axios.defaults.adapter = adapter;
}

// eslint-disable-next-line no-undef
if (process.env.WEBFLOW_API_TOKEN === undefined) {
  throw new Error("No Webflow API Token in Env");
}

const siteId = "5e31b06cb76b830809358a75";

// eslint-disable-next-line no-undef
const headers = { Authorization: `Bearer ${process.env.WEBFLOW_API_TOKEN}` };

const getAllItems = async (collectionId) => {
  let responseItems = [];
  let totalToFetch = 1;

  while (responseItems.length < totalToFetch) {
    const { data } = await axios({
      method: "get",
      url: `https://api.webflow.com/v2/collections/${collectionId}/items?offset=${responseItems.length}`,
      headers,
      responseType: "json",
    });
    responseItems = [...responseItems, ...data.items];
    totalToFetch = data.pagination.total;
  }

  return responseItems;
};

const getCollection = async (collectionId) => {
  return axios({
    method: "get",
    url: `https://api.webflow.com/v2/collections/${collectionId}`,
    headers,
    responseType: "json",
  });
};

const getAllCollections = async () => {
  return axios({
    method: "get",
    url: `https://api.webflow.com/v2/sites/${siteId}/collections`,
    headers,
    responseType: "json",
  });
};

const createItem = (item, collectionId, isDraft = true) => {
  return axios({
    method: "post",
    url: `https://api.webflow.com/v2/collections/${collectionId}/items`,
    headers: { ...headers, "content-type": "application/json" },
    data: {
      isArchived: false,
      isDraft: isDraft,
      fieldData: {
        ...item,
      },
    },
    responseType: "json",
  });
};

const modifyItem = (itemId, collectionId, body, method = "patch") => {
  return axios({
    method: method,
    url: `https://api.webflow.com/v2/collections/${collectionId}/items/${itemId}`,
    headers,
    data: {
      fieldData: {
        name: body.name,
      },
    },
    responseType: "json",
  });
};

const deleteItem = (itemId, collectionId) => {
  return axios({
    method: "delete",
    url: `https://api.webflow.com/v2/collections/${collectionId}/items/${itemId}`,
    headers,
  });
};

export { createItem, deleteItem, getAllCollections, getAllItems, getCollection, modifyItem };
