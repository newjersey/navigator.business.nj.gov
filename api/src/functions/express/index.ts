import { handlerPath } from "@libs/handlerResolver";
import { FnType } from "@functions/index";

export default (cognitoArn: string, vpcConfig: FnType["vpc"]): FnType => ({
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
  vpc: vpcConfig,
});
