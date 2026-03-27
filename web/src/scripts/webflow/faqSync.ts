import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { fileURLToPath } from "url";
import { catchRateLimitErrorAndRetry, resolveApiPromises } from "./helpers";
import { createItem, deleteItem, getAllItems, modifyItem } from "./methods";
import { WebflowCreateItemResponse, WebflowFaqFieldData, WebflowItem } from "./types";
import { faqCollectionId } from "./webflowIds";

interface CategoryOption {
  name: string;
  slug: string;
  id: string;
}

interface SubCategoryOption {
  name: string;
  slug: string;
  id: string;
}

const faqDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/faqs`,
);

// TODO: Consider managing these options via Decap
const categoryMap: CategoryOption[] = [
  { name: "Plan a Business", slug: "plan-a-business", id: "acd272aef61b78c5513c956a7ff19aa7" },
  { name: "Start a Business", slug: "start-a-business", id: "c98f77fc3a00bc67ec7dc62a882c8cef" },
  {
    name: "Operate a Business",
    slug: "operate-a-business",
    id: "4079af3822e05b78591d8872a917786e",
  },
  { name: "Grow a Business", slug: "grow-a-business", id: "ad67de5042946dd495649f7b3d69000b" },
  {
    name: "Finance a Business",
    slug: "finance-a-business",
    id: "ae99ce63bad69e9f1af0661836a12989",
  },
  { name: "Resources", slug: "resources", id: "3dfe438503f34f928300f2b5d94bd9e4" },
];

// TODO: Consider managing these options via Decap
const subCategoryMap: SubCategoryOption[] = [
  {
    name: "Starting a Business",
    slug: "starting-a-business",
    id: "fd312407834965b77ee1a8a85e1d3c2c",
  },
  {
    name: "Registering a Business",
    slug: "registering-a-business",
    id: "ec051f9b31fb71edaeaa0a764a11733a",
  },
  {
    name: "Choosing a Business Type",
    slug: "choosing-a-business-type",
    id: "4ce5d290627b1a2768e1010c3389f181",
  },
  {
    name: "Industry-Specific Guidance",
    slug: "industry-specific-guidance",
    id: "3791aa9969588486d14a2df4eba2d604",
  },
  {
    name: "Operate a Business",
    slug: "operate-a-business",
    id: "11ab04dc2ac9a1f378f500d912f92c30",
  },
  { name: "Hiring Employees", slug: "hiring-employees", id: "7eeb716e2226e488296a6f5ab72ae12e" },
  { name: "Exporting", slug: "exporting", id: "469dd85df5bf6aec923f90cc00804ac4" },
  {
    name: "Filings and Accounting",
    slug: "filings-and-accounting",
    id: "60e6fc0524c1168ac8b176f3416e3ea9",
  },
  { name: "Tax Information", slug: "tax-information", id: "feeff86270a370a84a57f0aa28e168c3" },
  { name: "Grow a Business", slug: "grow-a-business", id: "0edff79648ac52cf856f9ba149274317" },
  {
    name: "Contracting with the State",
    slug: "contracting-with-the-state",
    id: "eeac2a1702dd9518d4c6e7eb4a3b4efb",
  },
];

const getCategoryIdBySlug = (categorySlug?: string): string | undefined => {
  if (!categorySlug) return undefined;
  return categoryMap.find((c) => c.slug === categorySlug)?.id;
};

const getSubCategoryIdBySlug = (subCategorySlug?: string): string | undefined => {
  if (!subCategorySlug) return undefined;
  return subCategoryMap.find((c) => c.slug === subCategorySlug)?.id;
};

const getCategorySlugById = (categoryId?: string): string | undefined => {
  if (!categoryId) return undefined;
  return categoryMap.find((c) => c.id === categoryId)?.slug;
};

const getSubCategorySlugById = (subCategoryId?: string): string | undefined => {
  if (!subCategoryId) return undefined;
  return subCategoryMap.find((c) => c.id === subCategoryId)?.slug;
};

export interface Faq {
  name: string;
  slug: string;
  webflowId?: string;
  body: string;
  category?: string;
  "sub-category"?: string;
  author?: string;
}

const loadAllFaqsFromNavigator = (): Faq[] => {
  if (!fs.existsSync(faqDir)) {
    return [];
  }

  const faqFiles = fs.readdirSync(faqDir).filter((file) => file.endsWith(".md"));

  return faqFiles.map((file) => {
    const fullPath = path.join(faqDir, file);
    const fileContent = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContent);

    return {
      name: data.name as string,
      slug: data.slug as string,
      webflowId: data.webflowId as string | undefined,
      body: content,
      category: data.category as string | undefined,
      "sub-category": data["sub-category"] as string | undefined,
      author: data.author as string | undefined,
    };
  });
};

const getCurrentWebflowFaqs = async (): Promise<WebflowItem<WebflowFaqFieldData>[]> => {
  return await getAllItems<WebflowFaqFieldData>(faqCollectionId);
};

const faqToWebflowFormat = (faq: Faq): WebflowFaqFieldData => {
  return {
    name: faq.name,
    slug: faq.slug,
    "support-post": faq.body,
    category: getCategoryIdBySlug(faq.category),
    "sub-category": getSubCategoryIdBySlug(faq["sub-category"]),
    author: faq.author,
  };
};

const getOverlappingFaqs = (
  currentFaqs: WebflowItem<WebflowFaqFieldData>[],
  navigatorFaqs: Faq[],
): WebflowItem<WebflowFaqFieldData>[] => {
  const faqWebflowIds = new Set(
    navigatorFaqs.filter((faq) => faq.webflowId).map((faq) => faq.webflowId as string),
  );
  return currentFaqs.filter((item) => faqWebflowIds.has(item.id));
};

const getNewFaqs = async (navigatorFaqs: Faq[]): Promise<Faq[]> => {
  const current = await getCurrentWebflowFaqs();
  const currentWebflowIds = new Set(current.map((faq) => faq.id));

  return navigatorFaqs.filter((faq) => !faq.webflowId);
};

const getUnusedFaqs = async (navigatorFaqs: Faq[]): Promise<WebflowItem<WebflowFaqFieldData>[]> => {
  const current = await getCurrentWebflowFaqs();
  const faqWebflowIds = new Set(
    navigatorFaqs
      .filter((faq) => faq.webflowId !== undefined)
      .map((faq) => faq.webflowId as string),
  );
  return current.filter((item) => !faqWebflowIds.has(item.id));
};

const deleteFaqs = async (navigatorFaqs: Faq[]): Promise<void> => {
  const faqs = await getUnusedFaqs(navigatorFaqs);

  const deleteFaq = async (faq: WebflowItem<WebflowFaqFieldData>): Promise<void> => {
    console.info(`Attempting to delete ${faq.fieldData.slug}`);
    try {
      await deleteItem(faq.id, faqCollectionId);
    } catch (error) {
      await catchRateLimitErrorAndRetry(error, deleteItem, faq.id, faqCollectionId);
    }
  };

  const faqPromises = faqs.map((item): (() => Promise<void>) => {
    return (): Promise<void> => deleteFaq(item);
  });

  await resolveApiPromises(faqPromises);
};

const updateFaqs = async (navigatorFaqs: Faq[]): Promise<void> => {
  const currentFaqs = await getCurrentWebflowFaqs();
  const overlappingFaqs = getOverlappingFaqs(currentFaqs, navigatorFaqs);

  const modify = async (item: WebflowItem<WebflowFaqFieldData>): Promise<void> => {
    const navigatorFaq = navigatorFaqs.find((faq) => faq.webflowId === item.id);
    if (!navigatorFaq) return;

    const webflowFaq = faqToWebflowFormat(navigatorFaq);
    console.info(`Attempting to modify ${webflowFaq.slug} (${item.id})`);

    try {
      await modifyItem(item.id, faqCollectionId, webflowFaq as unknown as Record<string, unknown>);
    } catch (error) {
      await catchRateLimitErrorAndRetry(
        error,
        modifyItem,
        item.id,
        faqCollectionId,
        webflowFaq as unknown as Record<string, unknown>,
      );
    }
  };

  const faqPromises = overlappingFaqs.map((item): (() => Promise<void>) => {
    return (): Promise<void> => modify(item);
  });

  await resolveApiPromises(faqPromises);
};

const createNewFaqs = async (navigatorFaqs: Faq[]): Promise<void> => {
  const newFaqs = await getNewFaqs(navigatorFaqs);

  const create = async (faq: Faq): Promise<void> => {
    const webflowFaq = faqToWebflowFormat(faq);
    console.info(`Attempting to create ${webflowFaq.slug}`);

    let result;
    try {
      result = await createItem(
        webflowFaq as unknown as Record<string, unknown>,
        faqCollectionId,
        false,
      );
    } catch (error) {
      result = await catchRateLimitErrorAndRetry(
        error,
        createItem,
        webflowFaq as unknown as Record<string, unknown>,
        faqCollectionId,
        false,
      );
    }

    if (result && (result.data as WebflowCreateItemResponse).id && !faq.webflowId) {
      updateFaqFileWithWebflowId(faq.slug, (result.data as WebflowCreateItemResponse).id);
    }
  };

  const faqPromises = newFaqs.map((item): (() => Promise<void>) => {
    return (): Promise<void> => create(item);
  });

  await resolveApiPromises(faqPromises);
};

const updateFaqFileWithWebflowId = (slug: string, webflowId: string): void => {
  const filePath = path.join(faqDir, `${slug}.md`);

  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContent);

    data.webflowId = webflowId;

    const yamlFrontmatter = Object.entries(data)
      .map(([key, value]) => `${key}: "${String(value).replaceAll('"', '\\"')}"`)
      .join("\n");

    const newContent = `---
${yamlFrontmatter}
---

${content}
`;

    fs.writeFileSync(filePath, newContent, "utf8");
    console.info(`Updated ${filePath} with webflowId: ${webflowId}`);
  }
};

const syncFaqs = async (): Promise<void> => {
  const navigatorFaqs = loadAllFaqsFromNavigator();

  console.log(`Found ${navigatorFaqs.length} FAQs in Navigator`);

  console.log("Deleting unused FAQs from Webflow");
  await deleteFaqs(navigatorFaqs);

  console.log("Updating existing FAQs in Webflow");
  await updateFaqs(navigatorFaqs);

  console.log("Creating new FAQs in Webflow");
  await createNewFaqs(navigatorFaqs);

  console.log("Complete FAQ Sync!");
};

const main = async (): Promise<void> => {
  await syncFaqs();
  process.exit(0);
};

if (process.env.NODE_ENV !== "test") {
  (async (): Promise<void> => {
    await main();
  })();
}

export {
  categoryMap,
  createNewFaqs,
  deleteFaqs,
  faqToWebflowFormat,
  getCategoryIdBySlug,
  getCategorySlugById,
  getCurrentWebflowFaqs,
  getNewFaqs,
  getSubCategoryIdBySlug,
  getSubCategorySlugById,
  getUnusedFaqs,
  loadAllFaqsFromNavigator,
  subCategoryMap,
  syncFaqs,
  updateFaqFileWithWebflowId,
  updateFaqs,
};
