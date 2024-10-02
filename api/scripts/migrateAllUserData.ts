/* eslint-disable no-restricted-imports */
// Run yarn ts-node migrateAllUserData.ts

import * as fs from "node:fs";
import * as path from "node:path";

import { migrateUserData } from "../src/db/DynamoUserDataClient";
import { ConsoleLogWriter } from "../src/libs/logWriter";

type User = {
  email: string;
  data: unknown;
  userId: string;
};

type JsonObject = {
  Items: User[];
  Count: number;
  ScannedCount: number;
  ConsumedCapacity: unknown;
  NextToken: string;
};

const inputDirectory = ""; // Set this to wherever the files are located
const files: string[] = fs.readdirSync(inputDirectory);

const runMigrations = (users: User[]): void => {
  for (const user of users) {
    const logger = ConsoleLogWriter;
    migrateUserData(user.data, logger);
    console.log("\n");
  }
};

for (const file of files) {
  if (path.extname(file) === ".json") {
    const filePath: string = path.join(inputDirectory, file);
    const fileContent: string = fs.readFileSync(filePath, "utf8");
    const data: JsonObject = JSON.parse(fileContent);

    const users = data.Items;

    console.log({ filePath });
    console.log("number of users:", users.length);

    runMigrations(users);
  }
}
