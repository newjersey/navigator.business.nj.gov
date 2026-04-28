import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { FaqItem } from "../types/types";

const faqDirectory = path.join(process.cwd(), "..", "content", "src", "faqs");

export const loadAllFaqs = (): FaqItem[] => {
  if (!fs.existsSync(faqDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(faqDirectory).filter((file) => file.endsWith(".md"));

  return fileNames.map((fileName) => {
    const fullPath = path.join(faqDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      name: data.name,
      slug: data.slug,
      body: content,
      category: data.category ?? "",
      "sub-category": data["sub-category"] ?? "",
      webflowId: data.webflowId ?? "",
    };
  });
};
