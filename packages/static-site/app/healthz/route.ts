/** Return a lightweight health response for load balancers and container health checks. */
export const GET = (): Response => {
  return new Response("OK", {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
    status: 200,
  });
};
