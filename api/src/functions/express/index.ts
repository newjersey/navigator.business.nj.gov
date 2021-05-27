/* eslint-disable @typescript-eslint/no-explicit-any */

import { handlerPath } from "@libs/handlerResolver";

export default (cognitoArn: string): any => ({
  handler: `${handlerPath(__dirname)}/app.handler`,
  events: [
    {
      http: {
        method: "ANY",
        path: "/{proxy+}",
        authorizer: {
          arn: cognitoArn,
        },
        cors: true,
      },
    },
  ],
});
