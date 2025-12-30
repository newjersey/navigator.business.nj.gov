import { render } from "@react-email/render";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { WelcomeEmailB } from "./emails/welcomeEmailB";

const html = await render(<WelcomeEmailB />);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, "../email-templates");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, "welcomeEmailB.html"), html, "utf8");

console.log("✓ Email templates built successfully");
