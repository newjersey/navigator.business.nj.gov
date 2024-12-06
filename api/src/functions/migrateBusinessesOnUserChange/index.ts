import { FnType } from "@functions/fnType";
import { handlerPath } from "@libs/handlerResolver";

export default (vpcConfig: FnType["vpc"]): FnType => {
  const STAGE = process.env.STAGE || "local";
  const region = "us-east-1";
  const usersTable = `users-table-${STAGE}`;

  return {
    handler: `${handlerPath(__dirname)}/app.default`,
    timeout: 30,
    events: [
      {
        stream: {
          type: "dynamodb",
          arn: `arn:aws:dynamodb:${region}:*:table/${usersTable}`,
          batchSize: 5,
          startingPosition: "TRIM_HORIZON",
        },
      },
    ],
    vpc: vpcConfig,
  };
};
