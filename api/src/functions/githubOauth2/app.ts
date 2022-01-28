import bodyParser from "body-parser";
import cors from "cors";
import { randomBytes } from "crypto";
import dedent from "dedent";
import express from "express";
import serverless from "serverless-http";
import { AuthorizationCode, ModuleOptions } from "simple-oauth2";

const {
  CMS_OAUTH_CLIENT_ID = "",
  CMS_OAUTH_CLIENT_SECRET = "",
  CMS_OAUTH_HOST = "https://github.com",
  CMS_OAUTH_TOKEN_PATH = "/login/oauth/access_token",
  CMS_OAUTH_AUTHORIZE_PATH = "/login/oauth/authorize",
} = process.env;

export const oauthConfig: ModuleOptions = Object.freeze({
  client: Object.freeze({
    id: CMS_OAUTH_CLIENT_ID,
    secret: CMS_OAUTH_CLIENT_SECRET,
  }),
  auth: Object.freeze({
    tokenHost: CMS_OAUTH_HOST,
    tokenPath: CMS_OAUTH_TOKEN_PATH,
    authorizePath: CMS_OAUTH_AUTHORIZE_PATH,
  }),
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get("/api/cms/auth", (req, res) => {
  const { host } = req.headers;

  const authorizationCode = new AuthorizationCode(oauthConfig);

  const url = authorizationCode.authorizeURL({
    redirect_uri: `https://${host}/dev/api/cms/callback`,
    scope: `repo,user`,
    state: randomState(),
  });

  res.writeHead(301, { Location: url });
  res.end();
});

app.get("/api/cms/callback", async (req, res) => {
  try {
    const code = req.query.code as string;
    const { host } = req.headers;

    const authorizationCode = new AuthorizationCode(oauthConfig);

    const accessToken = await authorizationCode.getToken({
      code,
      redirect_uri: `https://${host}/dev/api/cms/callback`,
    });

    res.setHeader("Content-Type", "text/html");

    res.status(200).send(
      renderResponse("success", {
        token: accessToken.token["access_token"],
        provider: "github",
      })
    );
  } catch (e) {
    console.error(JSON.stringify(e));
    res.status(200).send(renderResponse("error", e));
  }
});

export const handler = serverless(app);

function randomState() {
  return randomBytes(6).toString("hex");
}

/** Render a html response with a script to finish a client-side github authentication */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderResponse(status: "success" | "error", content: any) {
  return dedent`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Authorizing ...</title>
    </head>
    <body>
      <p id="message"></p>
      <script>
        // Output a message to the user
        function sendMessage(message) {
          document.getElementById("message").innerText = message;
          document.title = message
        }
        // Handle a window message by sending the auth to the "opener"
        function receiveMessage(message) {
          console.debug("receiveMessage", message);
          window.opener.postMessage(
            'authorization:github:${status}:${JSON.stringify(content)}',
            message.origin
          );
          window.removeEventListener("message", receiveMessage, false);
          sendMessage("Authorized, closing ...");
        }
        sendMessage("Authorizing ...");
        window.addEventListener("message", receiveMessage, false);
        console.debug("postMessage", "authorizing:github", "*")
        window.opener.postMessage("authorizing:github", "*");
      </script>
    </body>
  </html>
  `;
}
