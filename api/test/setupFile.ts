import "dotenv/config";
import { setup } from "jest-dynalite";

// jest-dynalite injects dummy static AWS credentials for local DynamoDB. Keeping
// AWS_PROFILE set at the same time makes AWS SDK v3 warn about mixed sources.
if (process.env.AWS_PROFILE) {
  process.env.JEST_AWS_PROFILE = process.env.AWS_PROFILE;
  delete process.env.AWS_PROFILE;
}

setup("api/");
