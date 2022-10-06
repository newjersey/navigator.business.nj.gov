/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-undef */
import rehypeFormat from "rehype-format";
import rehypeRaw from "rehype-raw";
import rehypeRewrite from "rehype-rewrite";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { loadAllFundings } from "../fundingExport.mjs";
import { createItem, deleteItem, getAllItems, getCollection, modifyItem } from "./methods.mjs";
import { allIndustryId, getCurrentSectors, syncSectors } from "./sectorSync.mjs";

const getFundingTypeOptions = async () => {
  const itemResponse = await getCollection(fundingCollectionId);
  return itemResponse.data.fields.find((i) => i.slug == "funding-type").validations["options"];
};

const fundingTypeMap = [
  { name: "Grant", slug: "grant", id: "e84141a8393db92e7fbb14aad810be6d" },
  {
    name: "Technical Assistance",
    slug: "technical assistance",
    id: "cd5cfe0d3b986f16857bee1546a6b35a",
  },
  { name: "Loan", slug: "loan", id: "73274288235e87d48ca9b0227694455f" },
  { name: "Tax Credit", slug: "tax credit", id: "7d7a4a42eb088f70a3286137d4956ed9" },
  {
    name: "Hiring & Employee Training Support",
    slug: "hiring and employee training support",
    id: "c2384f35dc0ef1fe9ff53866504d6cfe",
  },
  { name: "Tax Exemption", slug: "tax exemption", id: "2c5989291051fa966295bd3cd6722fe6" },
];

const getAgencyOptions = async () => {
  const itemResponse = await getCollection(fundingCollectionId);
  return itemResponse.data.fields.find((i) => i.slug == "agency").validations["options"];
};

const agencyMap = [
  { name: "NJEDA", slug: "NJEDA", id: "af647a925b907472a8ad9f5fe07ba6ed" },
  { name: "NJDOL", slug: "NJDOL", id: "868ea3a1400bc3ae3d48cdabc909727a" },
  { name: "NJDEP", slug: "NJDEP", id: "e5191b387dca9f56520a9fb24ad56f74" },
  {
    name: "NJ Board of Public Utilities",
    slug: "NJ Board of Public Utilities",
    id: "15b93a9c93d07ea5929717526eb37704",
  },
  {
    name: "NJ Department of Treasury",
    slug: "NJ Department of Treasury",
    id: "b96fca38c289eabd7cda9bc33be8996a",
  },
];

const getFundingOptions = async () => {
  const itemResponse = await getCollection(fundingCollectionId);
  return itemResponse.data.fields.find((i) => i.slug == "funding-status").validations["options"];
};

const fundingStatusMap = [
  {
    name: "Rolling Application",
    slug: "rolling application",
    id: "d9e4ad4201a1644abbcad6666bace0bc",
  },
  {
    name: "First Come, First Serve",
    slug: "first come, first serve",
    id: "c44fb3cfdfb8a5b52d694a578d0338c1",
  },
  { name: "Deadline", slug: "deadline", id: "f8f3b6be7e7062b37365aa256928f47b" },
  { name: "Opening Soon", slug: "opening soon", id: "092a680902d359a5febce1189eec5aca" },
  { name: "Closed", slug: "closed", id: "d81ba489e3c255947bb4f67cb7012f6f" },
];

const fundingCollectionId = "6112e6b88aa567fdbc725ffc";

const getCurrentFundings = async () => {
  const itemResponse = await getAllItems(fundingCollectionId);
  return itemResponse.data.items;
};

const contentMdToObject = (content) => {
  let result = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeRewrite, {
      selector: "code",
      rewrite: (node) => {
        const obj = node.children[0];
        if (obj.value.includes("|")) {
          node.type = "text";
          node.value = obj.value.split("|")[0];
          delete node.children;
          delete node.properties;
          delete node.tagName;
        }
      },
    })
    .use(rehypeFormat)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .processSync(content).value;

  const itemsToRemove = ["<blockquote>", "</blockquote>", "<hr>"];
  itemsToRemove.map((i) => (result = result.replaceAll(i, "")));

  const lines = result.split("\n");
  const benefitRegExp = new RegExp(`>Benefit[s:]*?</`);
  const eligibilityIndex = lines.findIndex((line) => line.includes(">Eligibility</"));
  const benefitIndex = lines.findIndex((line) => benefitRegExp.test(line));
  try {
    if (eligibilityIndex == -1) throw new Error("Eligibility section missing");
    if (benefitIndex == -1) throw new Error(`Benefits section missing `);
  } catch (error) {
    console.info(content);
    throw error;
  }
  const getHtml = (arrayOfStrings, start, stop) =>
    arrayOfStrings
      .slice(start, stop)
      .map((i) => i.trim())
      .join(" ")
      .trim();
  return {
    "program-overview": getHtml(lines, 0, eligibilityIndex),
    eligibility: getHtml(lines, eligibilityIndex + 1, benefitIndex),
    benefit: getHtml(lines, benefitIndex + 1, -1),
  };
};

const fundingIdArray = () => new Set(loadAllFundings().map((i) => i.id));

const getFundingFromMd = (i, sectors) => {
  const industryReferenceArray = i.sector.map((i) => sectors.find((v) => v.slug == i)?._id);
  if (industryReferenceArray.some((i) => i == undefined)) throw new Error("Sectors must be synced first");
  const fundingType = fundingTypeMap.find((v) => v.slug == i.fundingType)?.id;
  if (fundingType == undefined) throw new Error("Funding Types are mis-matched, please check with webflow");
  const agency = agencyMap.find((v) => v.slug == i.agency[0])?.id;
  if (agency == undefined) throw new Error("Agency Types are mis-matched, please check with webflow");
  const status = fundingStatusMap.find((v) => v.slug == i.status)?.id;
  if (status == undefined) throw new Error("Funding Status Types are mis-matched, please check with webflow");

  return {
    ...contentMdToObject(i.contentMd),
    "learn-more-url": i.callToActionLink.trim(),
    agency,
    "application-close-date": i.dueDate ? new Date(i.dueDate).toISOString() : null,
    "start-date": i.openDate ? new Date(i.openDate).toISOString() : null,
    name: i.name,
    slug: i.id,
    "last-updated": new Date(Date.now()).toISOString(),
    "funding-status": status,
    "funding-type": fundingType,
    "industry-reference": industryReferenceArray.length > 0 ? industryReferenceArray : [allIndustryId],
  };
};

const getOverlappingFundingsFunc = (currentFundings) =>
  currentFundings.filter((item) => fundingIdArray().has(item.slug));

const getOverlappingFundings = async () => getOverlappingFundingsFunc(await getCurrentFundings());

const getNewFundings = async () => {
  const current = await getCurrentFundings();
  const sectors = await getCurrentSectors();
  const currentIdArray = new Set(current.map((sec) => sec.slug));
  return loadAllFundings()
    .filter((i) => !currentIdArray.has(i.id))
    .map((i) => getFundingFromMd(i, sectors));
};

const getUnUsedFundings = async () => {
  const current = await getCurrentFundings();
  const overLap = getOverlappingFundingsFunc(current);
  return current.filter((item) => !overLap.includes(item));
};

const deleteFundings = async () => {
  const fundings = await getUnUsedFundings();
  const deleteFunding = async (funding) => {
    console.info(`Attempting to create ${funding.slug}`);
    try {
      return await deleteItem(funding, fundingCollectionId);
    } catch (error) {
      console.error(error.response.data);
      throw error;
    }
  };
  await Promise.all(fundings.map(async (item) => await deleteFunding(item)));
};

const updateFundings = async () => {
  const sectors = await getCurrentSectors();
  const fundings = loadAllFundings();
  const overlappingFundings = await getOverlappingFundings();

  const modify = async (item) => {
    const funding = getFundingFromMd(
      fundings.find((i) => i.id == item.slug),
      sectors
    );
    console.info(`Attempting to modify ${funding.slug}`);
    try {
      return await modifyItem(item._id, fundingCollectionId, funding);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return Promise.all(overlappingFundings.map(async (item) => await modify(item)));
};
const createNewFundings = async () => {
  const newFundings = await getNewFundings();
  const create = async (funding) => {
    console.info(`Attempting to create ${funding.slug}`);
    try {
      return await createItem(funding, fundingCollectionId, false);
    } catch (error) {
      console.error(error.response.data);
      throw error;
    }
  };
  return await Promise.all(newFundings.map(async (item) => await create(item)));
};

const wait = (milliseconds = 10000) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const syncFundings = async () => {
  console.log("deleting unused fundings");
  await deleteFundings();
  console.log("updating fundings");
  await wait();
  await updateFundings();
  console.log("creating new fundings");
  await wait();
  await createNewFundings();
  console.log("Complete Funding Sync!");
};

// eslint-disable-next-line no-empty
if (!process.argv.some((i) => i.includes("fundingSync")) || process.env.NODE_ENV == "test") {
} else if (process.argv.some((i) => i.includes("--sync"))) {
  await (async () => {
    await syncFundings();
    process.exit(1);
  })();
} else if (process.argv.some((i) => i.includes("--previewUnused"))) {
  await (async () => {
    console.info(await getUnUsedFundings());
    process.exit(1);
  })();
} else if (process.argv.some((i) => i.includes("--previewCreate"))) {
  await (async () => {
    console.info(await getNewFundings());
    process.exit(1);
  })();
} else if (process.argv.some((i) => i.includes("--full"))) {
  await (async () => {
    await syncSectors();
    await syncFundings();
    process.exit(1);
  })();
} else {
  console.log("Expected at least one argument! Use one of the following: ");
  console.log("--sync =  Syncs fundings");
  console.log("--full = Syncs sectors and fundings");
  console.log("--previewUnused = Preview Fundings to Delete");
  console.log("--previewCreate = Preview Fundings to Create");
}
export {
  getNewFundings,
  getUnUsedFundings,
  deleteFundings,
  updateFundings,
  createNewFundings,
  syncFundings,
  getCurrentFundings,
  contentMdToObject,
  getFundingTypeOptions,
  getAgencyOptions,
  getFundingOptions,
  agencyMap,
};
