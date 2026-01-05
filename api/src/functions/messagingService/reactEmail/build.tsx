import { render, toPlainText } from "@react-email/render";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { WelcomeEmailShortVersion } from "./emails/welcomeEmailShortVersion";

const html = await render(<WelcomeEmailShortVersion />);
const plaintext = await toPlainText(html);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, "../email-templates");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, "welcomeEmailShortVersion.html"), html, "utf8");
fs.writeFileSync(path.join(outputDir, "welcomeEmailShortVersion.txt"), plaintext, "utf8");

console.log("✓ Email templates built successfully");
