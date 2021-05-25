import serverless from "serverless-http";
import express from "express";
import bodyParser from "body-parser";
import AWS from "aws-sdk";
import { userRouterFactory } from "../../api/userRouter";
import { DynamoUserDataClient } from "../../db/DynamoUserDataClient";
import cors from "cors";
import { municipalityRouterFactory } from "../../api/municipalityRouter";
import { AirtableMunicipalityClient } from "../../airtable/AirtableMunicipalityClient";
import { businessNameRouterFactory } from "../../api/businessNameRouter";
import { PostgresBusinessNameRepo } from "../../db/PostgresBusinessNameRepo";
import { searchBusinessNameFactory } from "../../domain/business-names/searchBusinessNameFactory";

const app = express();
app.use(bodyParser.json());
app.use(cors());

const connection = {
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "businesslocal",
  password: process.env.DB_PASSWORD || "",
  port: 5432,
};

const IS_OFFLINE = process.env.IS_OFFLINE;
const DYNAMO_OFFLINE_PORT = process.env.DYNAMO_PORT || 8000;
let dynamoDb: AWS.DynamoDB.DocumentClient;
if (IS_OFFLINE === "true") {
  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: "localhost",
    endpoint: `http://localhost:${DYNAMO_OFFLINE_PORT}`,
  });
} else {
  dynamoDb = new AWS.DynamoDB.DocumentClient();
}

const USERS_TABLE = process.env.USERS_TABLE || "users-table-local";

const airtableApiKey = process.env.AIRTABLE_API_KEY || "";
const airtableBaseId = process.env.AIRTABLE_BASE_ID || "";

const userDataClient = DynamoUserDataClient(dynamoDb, USERS_TABLE);
const airtableClient = AirtableMunicipalityClient(airtableApiKey, airtableBaseId);

const businessNameRepo = PostgresBusinessNameRepo(connection);
const searchBusinessName = searchBusinessNameFactory(businessNameRepo);

app.use(bodyParser.json({ strict: false }));
app.use("/api", userRouterFactory(userDataClient));
app.use("/api", municipalityRouterFactory(airtableClient));
app.use("/api", businessNameRouterFactory(searchBusinessName));

app.get("/health", (_req, res) => {
  res.send("Alive");
});

export const handler = serverless(app);
