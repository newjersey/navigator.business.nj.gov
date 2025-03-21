import { FnType } from "@functions/fnType";
import { handlerPath } from "@libs/handlerResolver";

export default (cognitoArn: string, vpcConfig: FnType["vpc"]): FnType => {
  return {
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
          path: "/api/external/{proxy+}",
          cors: true,
        },
      },
      {
        http: {
          method: "ANY",
          path: "/api/guest/{proxy+}",
          cors: true,
        },
      },
      {
        http: {
          method: "ANY",
          path: "/api/mgmt/{proxy+}",
          cors: true,
        },
      },
      {
        http: {
          method: "ANY",
          path: "/health/{proxy+}",
          cors: false,
        },
      },
      {
        http: {
          method: "POST",
          path: "/api/users/emailCheck",
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
  };
};
