import { FnType } from "@functions/fnType";
import { handlerPath } from "@libs/handlerResolver";

export default (vpcConfig: FnType["vpc"]): FnType => {
  const isProd = process.env.STAGE === "prod";
  return {
    handler: `${handlerPath(__dirname)}/app.default`,
    timeout: 30,
    events: [
      {
        schedule: {
          rate: [isProd ? "cron(*/5 18-23,0-5 * * ? *)" : "cron(*/5 0-5 ? * SUN *)"],
          enabled: true,
        },
      },
    ],
    vpc: vpcConfig,
  };
};
