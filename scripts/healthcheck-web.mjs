import http from "node:http";

const port = process.env.PORT ?? "3000";
const timeoutMilliseconds = 5_000;

const request = http.get(
  {
    hostname: "127.0.0.1",
    path: "/healthz",
    port,
  },
  (response) => {
    response.resume();
    if (response.statusCode !== 200) {
      console.error(`Health check returned HTTP ${response.statusCode ?? "unknown"}.`);
      process.exitCode = 1;
    }
  },
);

request.setTimeout(timeoutMilliseconds, () => {
  request.destroy(new Error(`Health check timed out after ${timeoutMilliseconds}ms.`));
});

request.on("error", (error) => {
  console.error(`Health check request failed: ${error.message}`);
  process.exitCode = 1;
});
