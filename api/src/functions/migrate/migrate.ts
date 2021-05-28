/* eslint-disable @typescript-eslint/ban-ts-comment */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda";

// @ts-ignore
import DBMigrate from "db-migrate";

import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";

type ValidatedEventAPIGatewayProxyEvent = Handler<Omit<APIGatewayProxyEvent, "body">, APIGatewayProxyResult>;

const migrate: ValidatedEventAPIGatewayProxyEvent = async () => {
  const dbmigrate = DBMigrate.getInstance(true);

  return dbmigrate
    .registerAPIHook()
    .then(() => {
      return dbmigrate
        .up()
        .then(() => true)
        .catch(() => false);
    })
    .catch(() => false);
};

export const handler = middy(migrate).use(middyJsonBodyParser());
