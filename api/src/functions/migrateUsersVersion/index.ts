import { FnType } from "@functions/fnType";
import { handlerPath } from "@libs/handlerResolver";

export default (vpcConfig: FnType["vpc"]): FnType => {
  return {
    handler: `${handlerPath(__dirname)}/app.default`,
    timeout: 30,
    events: [
      {
        schedule: {
          rate: ["cron(0 6 ? * SUN *)"],
          enabled: true,
        },
      },
    ],
    vpc: vpcConfig,
  };
};
