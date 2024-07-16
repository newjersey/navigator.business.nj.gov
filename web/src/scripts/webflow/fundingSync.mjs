/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-undef */
import { loadAllFundings } from "../fundingExport.mjs";
import {
  argsInclude,
  catchRateLimitErrorAndRetry,
  contentToStrings,
  getHtml,
  resolveApiPromises,
} from "./helpers.mjs";
import { wait } from "./helpers2.mjs";
import { createItem, deleteItem, getAllItems, getCollection, modifyItem } from "./methods.mjs";
import { allIndustryId, getCurrentSectors, syncSectors } from "./sectorSync.mjs";
import { certificationCollectionId, fundingCollectionId } from "./webflowIds.mjs";

const getFundingTypeOptions = async () => {
  const itemResponse = await getCollection(fundingCollectionId);
  return itemResponse.data.fields.find((i) => {
    return i.slug === "funding-type";
  }).validations["options"];
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

const getCertificationsOptions = async () => {
  const itemResponse = await getAllItems(certificationCollectionId);
  return itemResponse.map(({ name, slug, id: id, ...item }) => ({ name, slug, id }));
};

const fundingCertificationsMap = [
  { name: "Women Owned", slug: "woman-owned", id: "63efba3124109fa20ee2a419" },
  { name: "Minority Owned", slug: "minority-owned", id: "63efba7a2481c42cb943efa0" },
  { name: "Veteran Owned", slug: "veteran-owned", id: "63efbab568f2aece7aabf60a" },
  { name: "Disabled Veteran Owned", slug: "disabled-veteran", id: "63efbac5a51a4e0f4e57c6e9" },
  {
    name: "Small Business Enterprise",
    slug: "small-business-enterprise",
    id: "63efbad363a8a73927b7996c",
  },
  {
    name: "Disadvantaged Business Enterprise",
    slug: "disadvantaged-business-enterprise",
    id: "63efbae005c01736a1f89343",
  },
  {
    name: "Emerging Small Business Enterprise",
    slug: "emerging-small-business-enterprise",
    id: "63efbaeeae8cb961785aa8e8",
  },
];

const getAgencyOptions = async () => {
  const itemResponse = await getCollection(fundingCollectionId);
  return itemResponse.data.fields.find((i) => {
    return i.slug === "agency";
  }).validations["options"];
};

const agencyMap = {
  njeda: { name: "NJEDA", slug: "NJEDA", id: "af647a925b907472a8ad9f5fe07ba6ed" },
  njdol: { name: "NJDOL", slug: "NJDOL", id: "868ea3a1400bc3ae3d48cdabc909727a" },
  njdep: { name: "NJDEP", slug: "NJDEP", id: "e5191b387dca9f56520a9fb24ad56f74" },
  njdot: { name: "NJDOT", slug: "NJDOT", id: "5d5c1643d2b77d36a143d6ede5d8b6a2" },
  "nj-public-utilities": {
    name: "NJ Board of Public Utilities",
    slug: "NJ Board of Public Utilities",
    id: "15b93a9c93d07ea5929717526eb37704",
  },
  "nj-treasury": {
    name: "NJ Department of Treasury",
    slug: "NJ Department of Treasury",
    id: "b96fca38c289eabd7cda9bc33be8996a",
  },
  "nj-bac": {
    name: "New Jersey Business Action Center",
    slug: "New Jersey Business Action Center",
    id: "529992b90dbeaba3826e4afa761c1c8e",
  },
};

const getFundingOptions = async () => {
  const itemResponse = await getCollection(fundingCollectionId);
  return itemResponse.data.fields.find((i) => {
    return i.slug === "funding-status";
  }).validations["options"];
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

const getCurrentFundings = async () => {
  return await getAllItems(fundingCollectionId);
};

const contentMdToObject = (content) => {
  const lines = contentToStrings(content);
  const benefitRegExp = new RegExp(`"Benefit[s:]*?"`);
  const eligibilityIndex = lines.findIndex((line) => {
    return line.includes(">Eligibility</");
  });
  const benefitIndex = lines.findIndex((line) => {
    return benefitRegExp.test(line);
  });
  try {
    if (eligibilityIndex === -1) {
      throw new Error("Eligibility section missing");
    }
    if (benefitIndex === -1) {
      throw new Error(`Benefits section missing `);
    }
  } catch (error) {
    console.info(content);
    throw error;
  }

  return {
    "program-overview": getHtml(lines, 0, eligibilityIndex),
    eligibility: getHtml(lines, eligibilityIndex + 1, benefitIndex),
    benefit: getHtml(lines, benefitIndex + 1, -1),
  };
};

const validDate = (dueDate) => {
  if (!dueDate) {
    return true;
  }
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const current = new Date();
  current.setHours(0, 0, 0, 0);
  return due > current;
};

const getFilteredFundings = () => {
  return loadAllFundings().filter((funding) => {
    return validDate(funding.dueDate) && funding.publishStageArchive !== "Do Not Publish";
  });
};

const getFundingFromMd = (i, sectors) => {
  const industryReferenceArray = i.sector.map((i) => {
    return sectors.find((v) => {
      return v.fieldData.slug === i;
    })?.id;
  });
  if (industryReferenceArray.includes(undefined)) {
    throw new Error("Sectors must be synced first");
  }
  const fundingType = fundingTypeMap.find((v) => {
    return v.slug === i.fundingType;
  })?.id;
  if (fundingType === undefined) {
    throw new Error("Funding Types are mis-matched, please check with webflow");
  }
  const agency = agencyMap[i.agency[0]]?.id;
  if (agency === undefined) {
    throw new Error("Agency Types are mis-matched, please check with webflow");
  }
  const status = fundingStatusMap.find((v) => {
    return v.slug === i.status;
  })?.id;
  if (status === undefined) {
    throw new Error("Funding Status Types are mis-matched, please check with webflow");
  }

  const certifications =
    i.certifications?.map(
      (cert) =>
        fundingCertificationsMap.find((v) => {
          return v.slug === cert;
        })?.id
    ) ?? [];

  return {
    ...contentMdToObject(i.contentMd),
    "learn-more-url": i.callToActionLink.trim(),
    "certifications-2": certifications,
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

const getOverlappingFundingsFunc = (currentFundings) => {
  const filteredFundings = new Set(getFilteredFundings().map((i) => i.id));
  return currentFundings.filter((item) => {
    return filteredFundings.has(item.fieldData.slug);
  });
};

const getOverlappingFundings = async () => {
  return getOverlappingFundingsFunc(await getCurrentFundings());
};

const getNewFundings = async () => {
  const current = await getCurrentFundings();
  const sectors = await getCurrentSectors();
  const currentIdArray = new Set(
    current.map((sec) => {
      return sec.fieldData.slug;
    })
  );
  return getFilteredFundings()
    .filter((i) => {
      return !currentIdArray.has(i.id);
    })
    .map((i) => {
      return getFundingFromMd(i, sectors);
    });
};

const getUnUsedFundings = async () => {
  const current = await getCurrentFundings();
  const overLap = getOverlappingFundingsFunc(current);
  return current.filter((item) => {
    return !overLap.includes(item);
  });
};

const deleteFundings = async () => {
  const fundings = await getUnUsedFundings();
  const deleteFunding = async (funding) => {
    console.info(`Attempting to delete ${funding.slug}`);
    try {
      return await deleteItem(funding.id, fundingCollectionId);
    } catch (error) {
      await catchRateLimitErrorAndRetry(error, deleteItem, funding.id, fundingCollectionId);
    }
  };

  const fundingPromises = fundings.map((item) => {
    return () => deleteFunding(item);
  });
  await resolveApiPromises(fundingPromises);
};

const updateFundings = async () => {
  const sectors = await getCurrentSectors();
  const fundings = getFilteredFundings();
  const overlappingFundings = await getOverlappingFundings();

  const modify = async (item) => {
    const funding = getFundingFromMd(
      fundings.find((i) => {
        return i.id === item.fieldData.slug;
      }),
      sectors
    );
    console.info(`Attempting to modify ${funding.slug}`);
    try {
      return await modifyItem(item.id, fundingCollectionId, funding);
    } catch (error) {
      await catchRateLimitErrorAndRetry(error, modifyItem, item.id, fundingCollectionId, funding);
    }
  };

  const fundingsPromises = overlappingFundings.map((item) => {
    return () => modify(item);
  });

  await resolveApiPromises(fundingsPromises);
};
const createNewFundings = async () => {
  const newFundings = await getNewFundings();
  const create = async (funding) => {
    console.info(`Attempting to create ${funding.slug}`);
    try {
      return await createItem(funding, fundingCollectionId, false);
    } catch (error) {
      await catchRateLimitErrorAndRetry(error, createItem, funding, fundingCollectionId, false);
    }
  };

  const fundingPromises = newFundings.map((item) => {
    return () => create(item);
  });

  await resolveApiPromises(fundingPromises);
};

const syncFundings = async () => {
  console.log("deleting unused fundings");
  await deleteFundings();
  console.log("updating fundings");
  await updateFundings();
  console.log("creating new fundings");
  await createNewFundings();
  console.log("Complete Funding Sync!");
};

// eslint-disable-next-line no-empty
if (!argsInclude("fundingSync") || process.env.NODE_ENV === "test") {
  // intentionally empty
} else if (argsInclude("--sync")) {
  await (async () => {
    await syncFundings();
    process.exit(0);
  })();
} else if (argsInclude("--previewUnused")) {
  await (async () => {
    console.info(await getUnUsedFundings());
    process.exit(0);
  })();
} else if (argsInclude("--previewCreate")) {
  await (async () => {
    console.info(await getNewFundings());
    process.exit(0);
  })();
} else if (argsInclude("--full")) {
  await (async () => {
    await syncSectors();
    if (argsInclude("--ci-sync")) await wait(60000); // Wait 1 minute to avoid exceeding rate limit
    await syncFundings();
    if (argsInclude("--ci-sync")) await wait(60000); // Wait 1 minute to avoid exceeding rate limit
    process.exit(0);
  })();
} else {
  console.log("Expected at least one argument! Use one of the following: ");
  console.log("--sync =  Syncs fundings");
  console.log("--full = Syncs sectors and fundings");
  console.log("--previewUnused = Preview Fundings to Delete");
  console.log("--previewCreate = Preview Fundings to Create");
  process.exit(1);
}
export {
  agencyMap,
  contentMdToObject,
  createNewFundings,
  deleteFundings,
  getAgencyOptions,
  getCertificationsOptions,
  getCurrentFundings,
  getFundingOptions,
  getFundingTypeOptions,
  getNewFundings,
  getUnUsedFundings,
  syncFundings,
  updateFundings,
};
