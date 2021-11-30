import { handlerPath } from "@libs/handlerResolver";
import { FnType } from "@functions/index";

export default (vpcConfig: FnType["vpc"]): FnType => ({
  handler: `${handlerPath(__dirname)}/app.default`,
  timeout: 30,
  events: [],
  vpc: vpcConfig,
});
