import { handlerPath } from "@libs/handlerResolver";
import { FnType } from "@functions/index";

export default (cognitoArn: string, vpcConfig: FnType["vpc"]): FnType => ({
  handler: `${handlerPath(__dirname)}/app.handler`,
  timeout: 66,
  events: [
    {
      http: {
        method: "ANY",
        path: "/api/test-license-status", // DELETE ME WHEN TESTING WORK DONE
        cors: true,
      },
    },
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
  vpc: vpcConfig,
});
