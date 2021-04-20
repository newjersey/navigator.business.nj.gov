import "@testing-library/jest-dom";

import fetch from "node-fetch";

process.env.API_BASE_URL = "";

global.fetch = window.fetch = fetch;
global.Request = window.Request = fetch.Request;
global.Response = window.Response = fetch.Response;
