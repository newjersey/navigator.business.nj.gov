import { FaqItem } from "../../types";
import { convertFileDataToMatchList } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchFaqs = (faqs: FaqItem[], term: string): Match[] => {
  const faqData = getFaqData(faqs);

  return convertFileDataToMatchList(faqData, term);
};

export const getFaqData = (faqs: FaqItem[]): FileData[] => {
  const faqData: FileData[] = [];

  for (const faq of faqs) {
    const name = faq.name.toLowerCase();
    const slug = faq.slug.toLowerCase();
    const body = faq.body.toLowerCase();
    const category = faq.category?.toLowerCase();
    const subCategory = faq["sub-category"]?.toLowerCase();

    const blockTexts = [body];

    const labelledTexts = [
      { content: name, label: "FAQ Title" },
      { content: slug, label: "Slug" },
      { content: category, label: "Category" },
      { content: subCategory, label: "Sub-Category" },
    ];

    faqData.push({
      fileName: faq.slug,
      labelledTexts,
      blockTexts,
      listTexts: [],
    });
  }

  return faqData;
};
