import { FnType } from "@functions/index";
import { handlerPath } from "@libs/handlerResolver";

export default (vpcConfig: FnType["vpc"]): FnType => ({
  handler: `${handlerPath(__dirname)}/app.default`,
  timeout: 30,
  events: [],
  vpc: vpcConfig,
});
