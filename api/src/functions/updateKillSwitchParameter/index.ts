import { FnType } from "@functions/fnType";
import { handlerPath } from "@libs/handlerResolver";
export default (vpcConfig: FnType["vpc"]): FnType => {
  return {
    handler: `${handlerPath(__dirname)}/app.handler`,
    timeout: 10,
    events: [
      {
        sns: {
          arn: `arn:aws:sns:us-east-1:${process.env.AWS_ACCOUNT_ID}:bfs-navigator-${process.env.STAGE}-migrationLambda-Topic`,
        },
      },
    ],
    vpc: vpcConfig,
  };
};
