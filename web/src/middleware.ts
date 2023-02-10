/* eslint-disable @next/next/no-server-import-in-page */

import { NextURL } from "next/dist/server/web/next-url";
import { NextRequest, NextResponse } from "next/server";

const BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME;
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD;

export const config = {
  matcher: "/:path*",
};

export function middleware(req: NextRequest) {
  console.log("in middleware");
  console.log("use basic auth value:", process.env.USE_BASIC_AUTH);

  if (process.env.USE_BASIC_AUTH !== "true") {
    console.log("is not true - skipping auth");
    return;
  }

  const basicAuth = req.headers.get("authorization");

  if (basicAuth) {
    console.log("basic auth exists - validating", basicAuth);
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    if (user === BASIC_AUTH_USERNAME && pwd === BASIC_AUTH_PASSWORD) {
      return NextResponse.next();
    }
  }

  const newUrl = new NextURL(`${process.env.API_BASE_URL}/basicauth`);
  console.log("sending to auth at", newUrl);

  return NextResponse.rewrite(newUrl);
}
