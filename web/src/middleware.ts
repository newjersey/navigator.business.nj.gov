/* eslint-disable @next/next/no-server-import-in-page */

import { NextRequest, NextResponse } from "next/server";

const BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME;
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD;

export const config = {
  matcher: "/:path*",
};

export function middleware(req: NextRequest) {
  if (process.env.USE_BASIC_AUTH !== "true") {
    return;
  }

  const basicAuth = req.headers.get("authorization");
  const url = req.nextUrl;

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    if (user === BASIC_AUTH_USERNAME && pwd === BASIC_AUTH_PASSWORD) {
      return NextResponse.next();
    }
  }
  url.pathname = "/api/basicauth";

  return NextResponse.rewrite(url);
}
