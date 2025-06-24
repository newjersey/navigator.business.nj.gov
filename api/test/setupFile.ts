import * as dotenv from "dotenv";
import { setup } from "jest-dynalite";
import * as path from "node:path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

setup("api/");
