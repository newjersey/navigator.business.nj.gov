import { STAGE } from "@functions/config";
import { FnType } from "@functions/fnType";
import { handlerPath } from "@libs/handlerResolver";
export default (vpcConfig: FnType["vpc"]): FnType => {
  return {
    handler: `${handlerPath(__dirname)}/app.handler`,
    timeout: 10,
    events: [
      {
        sns: {
          topicName: `bfs-navigator-${STAGE}-migrationLambda-Topic`,
        },
      },
    ],
    vpc: vpcConfig,
  };
};
