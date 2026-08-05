import { setupExpress } from "@libs/express";
import { ErrorRequestHandler } from "express";
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
