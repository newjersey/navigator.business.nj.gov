import axios from "axios";
import adapter from "axios/lib/adapters/http.js";

if (typeof process != "undefined") {
  axios.defaults.adapter = adapter;
}

// eslint-disable-next-line no-undef
if (process.env.WEBFLOW_API_TOKEN == undefined && process.env.NODE_ENV != "test")
  throw new Error("No Webflow API Token in Env");

// eslint-disable-next-line no-undef
const headers = { Authorization: `Bearer ${process.env.WEBFLOW_API_TOKEN}` };

const getAllItems = async (id) =>
  (
    await axios({
      method: "get",
      url: `https://api.webflow.com/collections/${id}/items`,
      headers,
      responseType: "json",
      // eslint-disable-next-line unicorn/no-await-expression-member
    })
  ).data.items;

const createItem = (item, collectionId, draft = true) =>
  axios({
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

const modifyItem = (id, collectionId, body, method = "patch") =>
  axios({
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

const deleteItem = (item, collectionId, unPublish = false) =>
  axios({
    method: "delete",
    url: `https://api.webflow.com/collections/${collectionId}/items/${item._id}`,
    params: { live: unPublish },
    headers,
  });

export { deleteItem, modifyItem, createItem, getAllItems };
