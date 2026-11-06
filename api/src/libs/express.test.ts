import { deflateSync, gzipSync } from "node:zlib";
import { setupExpress } from "@libs/express";
import type { ErrorRequestHandler } from "express";
import request from "supertest";

const sendErrorResponse: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  res.status(500).json({ message: error.message, path: req.path });
};

describe("setupExpress", () => {
  it("parses JSON request bodies", async () => {
    const app = setupExpress(false, false);
    app.post("/echo", (req, res) => {
      res.json(req.body);
    });

    const response = await request(app).post("/echo").send({ businessName: "Navigator LLC" });

    expect(response.body).toEqual({ businessName: "Navigator LLC" });
  });

  it("preserves extended form and query parsing", async () => {
    const app = setupExpress(false, false);
    app.post("/echo", (req, res) => {
      res.json({ body: req.body, query: req.query });
    });

    const response = await request(app)
      .post("/echo?filters[status]=active")
      .type("form")
      .send({ "business[name]": "Navigator LLC" });

    expect(response.body).toEqual({
      body: { business: { name: "Navigator LLC" } },
      query: { filters: { status: "active" } },
    });
  });

  it("parses gzip-compressed JSON request bodies", async () => {
    const app = setupExpress(false, false);
    app.post("/echo", (req, res) => {
      res.json(req.body);
    });
    const body = { businessName: "Navigator LLC" };
    const pendingRequest = request(app)
      .post("/echo")
      .set("Content-Type", "application/json")
      .set("Content-Encoding", "gzip");

    pendingRequest.write(gzipSync(JSON.stringify(body)));
    const response = await pendingRequest;

    expect(response.status).toBe(200);
    expect(response.body).toEqual(body);
  });

  it("parses gzip-compressed extended form request bodies", async () => {
    const app = setupExpress(false, false);
    app.post("/echo", (req, res) => {
      res.json(req.body);
    });
    const pendingRequest = request(app)
      .post("/echo")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Content-Encoding", "gzip");

    pendingRequest.write(gzipSync("business%5Bname%5D=Navigator%20LLC"));
    const response = await pendingRequest;

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ business: { name: "Navigator LLC" } });
  });

  it("continues serving requests after trailing bytes on a deflate-compressed body", async () => {
    const app = setupExpress(false, false);
    app.post("/echo", (req, res) => {
      res.json(req.body);
    });
    const body = { businessName: "Navigator LLC" };
    const pendingRequest = request(app)
      .post("/echo")
      .set("Content-Type", "application/json")
      .set("Content-Encoding", "deflate");

    // Send raw bytes so Supertest does not JSON-serialize the compressed buffer.
    pendingRequest.write(deflateSync(JSON.stringify(body)));
    pendingRequest.write(Buffer.from("invalid trailing data"));
    const response = await pendingRequest;
    const subsequentResponse = await request(app).post("/echo").send(body);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(body);
    expect(subsequentResponse.status).toBe(200);
    expect(subsequentResponse.body).toEqual(body);
  });

  it("preserves an empty object for requests without a parsed body", async () => {
    const app = setupExpress(false, false);
    app.post("/echo", (req, res) => {
      res.json(req.body);
    });

    const response = await request(app).post("/echo");

    expect(response.body).toEqual({});
  });

  it("rejects malformed JSON", async () => {
    const app = setupExpress(false, false);
    app.post("/echo", (req, res) => {
      res.json(req.body);
    });

    const response = await request(app)
      .post("/echo")
      .set("Content-Type", "application/json")
      .send('{"businessName":');

    expect(response.status).toBe(400);
  });

  it("rejects JSON primitives", async () => {
    const app = setupExpress(false, false);
    app.post("/echo", (req, res) => {
      res.json(req.body);
    });

    const response = await request(app)
      .post("/echo")
      .set("Content-Type", "application/json")
      .send('"Navigator LLC"');

    expect(response.status).toBe(400);
  });

  it("forwards rejected handler promises to error middleware", async () => {
    const app = setupExpress(false, false);
    app.get("/failure", async () => {
      throw new Error("request failed");
    });
    app.use(sendErrorResponse);

    const response = await request(app).get("/failure");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "request failed", path: "/failure" });
  });
});
