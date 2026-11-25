import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { render, toPlainText } from "@react-email/render";
import { WelcomeEmailShortVersion } from "./emails/welcomeEmailShortVersion";

interface EmailTemplate {
  readonly name: string;
  readonly element: Parameters<typeof render>[0];
}

const templates: readonly EmailTemplate[] = [
  { name: "welcomeEmailShortVersion", element: <WelcomeEmailShortVersion /> },
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, "../email-templates");

async function buildEmailTemplate(template: EmailTemplate): Promise<void> {
  const html = await render(template.element);
  const plaintext = await toPlainText(html);

  fs.writeFileSync(path.join(outputDir, `${template.name}.html`), html, "utf8");
  fs.writeFileSync(path.join(outputDir, `${template.name}.txt`), plaintext, "utf8");
}

async function buildEmailTemplates(emailTemplates: readonly EmailTemplate[]): Promise<void> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await Promise.all(emailTemplates.map(buildEmailTemplate));
}

await buildEmailTemplates(templates);
console.log("✓ Email templates built successfully");
