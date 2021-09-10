import { handlerPath } from "@libs/handlerResolver";
import { FnType } from "@functions/index";

export default (cognitoArn: string, vpcConfig: FnType["vpc"], disableAuth: string): FnType => ({
  handler: `${handlerPath(__dirname)}/app.handler`,
  timeout: 30,
  events: [
    {
      http: {
        method: "ANY",
        path: "/api/self-reg",
        cors: true,
      },
    },
    {
      http: {
        method: "ANY",
        path: "/{proxy+}",
        authorizer: disableAuth
          ? undefined
          : {
              arn: cognitoArn,
            },
        cors: true,
      },
    },
  ],
  vpc: vpcConfig,
});
