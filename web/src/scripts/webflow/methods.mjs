import axios from "axios";
import adapter from "axios/lib/adapters/http.js";

if (typeof process != "undefined") {
  axios.defaults.adapter = adapter;
}

// eslint-disable-next-line no-undef
if (process.env.WEBFLOW_API_TOKEN == undefined) {
  throw new Error("No Webflow API Token in Env");
}

const siteId = "5e31b06cb76b830809358a75";

// eslint-disable-next-line no-undef
const headers = { Authorization: `Bearer ${process.env.WEBFLOW_API_TOKEN}` };

const getAllItems = async (id) => {
  let responseItems = [];
  let totalToFetch = 1;

  while (responseItems.length < totalToFetch) {
    const data = (
      await axios({
        method: "get",
        url: `https://api.webflow.com/collections/${id}/items?offset=${responseItems.length}`,
        headers,
        responseType: "json",
      })
    ).data;
    responseItems = [...responseItems, ...data.items];
    totalToFetch = data.total;
  }

  return responseItems;
};

const getCollection = async (id) => {
  return axios({
    method: "get",
    url: `https://api.webflow.com/collections/${id}`,
    headers,
    responseType: "json",
  });
};

const getAllCollections = async () => {
  return axios({
    method: "get",
    url: `https://api.webflow.com/sites/${siteId}/collections`,
    headers,
    responseType: "json",
  });
};

const createItem = (item, collectionId, draft = true) => {
  return axios({
    method: "post",
    url: `https://api.webflow.com/collections/${collectionId}/items`,
    headers: { ...headers, "content-type": "application/json" },
    data: {
      fields: {
        _archived: false,
        _draft: draft,
        ...item,
      },
    },
    responseType: "json",
  });
};

const modifyItem = (id, collectionId, body, method = "patch") => {
  return axios({
    method: method,
    url: `https://api.webflow.com/collections/${collectionId}/items/${id}`,
    headers,
    data: {
      fields: {
        ...body,
      },
    },
    responseType: "json",
  });
};

const deleteItem = (item, collectionId, unPublish = false) => {
  return axios({
    method: "delete",
    url: `https://api.webflow.com/collections/${collectionId}/items/${item._id}`,
    params: { live: unPublish },
    headers,
  });
};

export { deleteItem, modifyItem, createItem, getAllItems, getCollection, getAllCollections };
