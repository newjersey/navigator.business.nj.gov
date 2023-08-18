import { FnType } from "@functions/fnType";
import { handlerPath } from "@libs/handlerResolver";

export default (vpcConfig: FnType["vpc"]): FnType => {
  return {
    handler: `${handlerPath(__dirname)}/app.handler`,
    timeout: 30,
    events: [
      {
        http: {
          method: "get",
          path: "/api/cms/{proxy+}",
          cors: true
        }
      }
    ],
    vpc: vpcConfig
  };
};
