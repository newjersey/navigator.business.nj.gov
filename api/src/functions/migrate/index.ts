import { handlerPath } from "@libs/handlerResolver";
import { FnType } from "@functions/index";

export default (databaseUrl: string): FnType => ({
  handler: `${handlerPath(__dirname)}/migrate.handler`,
  environment: {
    DATABASE_URL: databaseUrl,
  },
});
