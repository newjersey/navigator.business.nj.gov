import "@testing-library/jest-dom";

import fetch from "node-fetch";

process.env.API_BASE_URL = "";
process.env.AIRTABLE_API_KEY = "";
process.env.AIRTABLE_BASE_ID = "";

global.fetch = window.fetch = fetch;
global.Request = window.Request = fetch.Request;
global.Response = window.Response = fetch.Response;
