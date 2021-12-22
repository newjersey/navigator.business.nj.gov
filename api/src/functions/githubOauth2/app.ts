import bodyParser from "body-parser";
import cors from "cors";
import { randomBytes } from "crypto";
import dedent from "dedent";
import express from "express";
import serverless from "serverless-http";
import { AuthorizationCode, ModuleOptions } from "simple-oauth2";

const {
  OAUTH_CLIENT_ID = "",
  OAUTH_CLIENT_SECRET = "",
  OAUTH_HOST = "https://github.com",
  OAUTH_TOKEN_PATH = "/login/oauth/access_token",
  OAUTH_AUTHORIZE_PATH = "/login/oauth/authorize",
} = process.env;

export const oauthConfig: ModuleOptions = Object.freeze({
  client: Object.freeze({
    id: OAUTH_CLIENT_ID,
    secret: OAUTH_CLIENT_SECRET,
  }),
  auth: Object.freeze({
    tokenHost: OAUTH_HOST,
    tokenPath: OAUTH_TOKEN_PATH,
    authorizePath: OAUTH_AUTHORIZE_PATH,
  }),
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get("/api/cms/auth", (req, res) => {
  const { host } = req.headers;

  console.debug("auth host=%o", host);

  const authorizationCode = new AuthorizationCode(oauthConfig);

  const url = authorizationCode.authorizeURL({
    redirect_uri: `https://${host}/api/cms/callback`,
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
      redirect_uri: `https://${host}/api/cms/callback`,
    });

    console.debug("callback host=%o", host);

    const { token } = authorizationCode.createToken(accessToken);

    res.setHeader("Content-Type", "text/html");

    res.status(200).send(
      renderResponse("success", {
        token: token.token.access_token,
        provider: "github",
      })
    );
  } catch (e) {
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
