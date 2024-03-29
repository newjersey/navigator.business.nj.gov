import { FnType } from "@functions/fnType";
import { handlerPath } from "@libs/handlerResolver";

export default (vpcConfig: FnType["vpc"]): FnType => {
  return {
    handler: `${handlerPath(__dirname)}/app.default`,
    timeout: 30,
    events: [],
    vpc: vpcConfig,
  };
};
