/* eslint-disable @next/next/no-server-import-in-page */

import { NextURL } from "next/dist/server/web/next-url";
import { NextRequest, NextResponse } from "next/server";

const BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME;
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD;

export const config = {
  matcher: "/((?!_next/static|_next/image|js|img|vendor|intercom|favicon.ico|healthz).*)",
};

export function middleware(req: NextRequest) {
  const authenticated = req.cookies.has(
    `CognitoIdentityServiceProvider.${process.env.COGNITO_WEB_CLIENT_ID}.LastAuthUser`
  );

  if (process.env.USE_BASIC_AUTH !== "true" || authenticated) {
    return NextResponse.next();
  }

  const basicAuth = req.headers.get("authorization");

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = Buffer.from(authValue, "base64").toString().split(":");

    if (user === BASIC_AUTH_USERNAME && pwd === BASIC_AUTH_PASSWORD) {
      return NextResponse.next();
    }
  }

  const newUrl = new NextURL(`${process.env.API_BASE_URL}/basicauth`);

  return NextResponse.rewrite(newUrl);
}
