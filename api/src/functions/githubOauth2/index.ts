import { FnType } from "@functions/index";
import { handlerPath } from "@libs/handlerResolver";

export default (vpcConfig: FnType["vpc"]): FnType => ({
  handler: `${handlerPath(__dirname)}/app.handler`,
  timeout: 30,
  events: [
    {
      http: {
        method: "get",
        path: "/api/cms/{proxy+}",
        cors: true,
      },
    },
  ],
  vpc: vpcConfig,
});
