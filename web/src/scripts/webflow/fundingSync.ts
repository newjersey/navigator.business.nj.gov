import { SectorType } from "@businessnjgovnavigator/shared/sector";
import fs from "fs";
import { orderBy } from "lodash";
import path from "path";
import { fileURLToPath } from "url";
import { Funding, loadAllFundings } from "../fundingExport";
import {
  catchRateLimitErrorAndRetry,
  contentToStrings,
  getHtml,
  resolveApiPromises,
  wait,
} from "./helpers";
import { createItem, deleteItem, getAllItems, getCollection, modifyItem } from "./methods";
import {
  AgencyOption,
  FundingCertificationOption,
  FundingStatusOption,
  FundingTypeOption,
  SectorsJson,
  WebflowCollectionFieldOption,
  WebflowFundingFieldData,
  WebflowItem,
  WebflowSector,
  WebflowSectorFieldData,
} from "./types";
import {
  allIndustryId,
  certificationCollectionId,
  fundingCollectionId,
  sectorCollectionId,
} from "./webflowIds";

const sectorDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/mappings`,
);

const getFundingTypeOptions = async (): Promise<WebflowCollectionFieldOption[]> => {
  const itemResponse = await getCollection(fundingCollectionId);
  return (
    itemResponse.data.fields.find((i) => {
      return i.slug === "funding-type";
    })?.validations?.options || []
  );
};

// TODO: Come back to this
const fundingTypeMap: FundingTypeOption[] = [
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

const getCertificationsOptions = async (): Promise<FundingCertificationOption[]> => {
  const itemResponse = await getAllItems<{ name: string; slug: string }>(certificationCollectionId);
  return itemResponse.map(({ fieldData, id }) => ({
    name: fieldData.name,
    slug: fieldData.slug,
    id,
  }));
};

const fundingCertificationsMap: FundingCertificationOption[] = [
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

const getAgencyOptions = async (): Promise<WebflowCollectionFieldOption[]> => {
  const itemResponse = await getCollection(fundingCollectionId);
  return (
    itemResponse.data.fields.find((i) => {
      return i.slug === "agency";
    })?.validations?.options || []
  );
};

// TODO: Come back to this
const agencyMap: Record<string, AgencyOption> = {
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
  "invest-newark": {
    name: "Invest Newark",
    slug: "Invest Newark",
    id: "e6e7d41a5377718d251859ceea418ed6",
  },
};

const getFundingOptions = async (): Promise<WebflowCollectionFieldOption[]> => {
  const itemResponse = await getCollection(fundingCollectionId);
  return (
    itemResponse.data.fields.find((i) => {
      return i.slug === "funding-status";
    })?.validations?.options || []
  );
};

// TODO: Come back to this
const fundingStatusMap: FundingStatusOption[] = [
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

const getCurrentFundings = async (): Promise<WebflowItem<WebflowFundingFieldData>[]> => {
  return await getAllItems<WebflowFundingFieldData>(fundingCollectionId);
};

const contentMdToObject = (
  content: string,
): {
  "program-overview": string;
  eligibility: string;
  benefit: string;
} => {
  const lines = contentToStrings(content);
  const benefitRegExp = new RegExp(`"Benefit[s:]*?"`);
  const eligibilityIndex = lines.findIndex((line) => {
    return line.includes(">Eligibility</") || line.includes(">Eligible Expenses<");
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

const validDate = (dueDate?: string): boolean => {
  if (!dueDate) {
    return true;
  }
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const current = new Date();
  current.setHours(0, 0, 0, 0);
  return due > current;
};

const getFilteredFundings = (): Funding[] => {
  return loadAllFundings().filter((funding) => {
    return validDate(funding.dueDate) && funding.publishStageArchive !== "Do Not Publish";
  });
};

const getFundingFromMd = (
  i: Funding,
  sectors: WebflowItem<WebflowSectorFieldData>[],
): WebflowFundingFieldData => {
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
    throw new Error(
      `Funding Types for funding type ${i.fundingType} are mis-matched in ${i.id}. Please check with Webflow.`,
    );
  }
  const agency = agencyMap[i.agency[0]]?.id;
  if (agency === undefined) {
    /*  If the following error is thrown, it may be because the agency doesn't exist in Webflow.
        You will have to create the agency in Webflow, then call the collection details endpoint
        with the fundingCollectionId to get the ID of the option, then adding it to agencyMap. */
    throw new Error(
      `Agency Types for agency ${i.agency[0]} are mis-matched in ${i.id}. Please check with Webflow.`,
    );
  }
  const status = fundingStatusMap.find((v) => {
    return v.slug === i.status;
  })?.id;
  if (status === undefined) {
    throw new Error(
      `Funding Status Types for funding status type ${i.status} are mis-matched in ${i.id}. Please check with Webflow.`,
    );
  }

  const certifications =
    i.certifications
      ?.map(
        (cert) =>
          fundingCertificationsMap.find((v) => {
            return v.slug === cert;
          })?.id,
      )
      .filter((id): id is string => id !== undefined) ?? [];

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
    "industry-reference":
      industryReferenceArray.length > 0 ? (industryReferenceArray as string[]) : [allIndustryId],
  };
};

const getOverlappingFundingsFunc = (
  currentFundings: WebflowItem<WebflowFundingFieldData>[],
): WebflowItem<WebflowFundingFieldData>[] => {
  const filteredFundings = new Set(getFilteredFundings().map((i) => i.id));
  return currentFundings.filter((item) => {
    return filteredFundings.has(item.fieldData.slug);
  });
};

const getOverlappingFundings = async (): Promise<WebflowItem<WebflowFundingFieldData>[]> => {
  return getOverlappingFundingsFunc(await getCurrentFundings());
};

const getNewFundings = async (): Promise<WebflowFundingFieldData[]> => {
  const current = await getCurrentFundings();
  const sectors = await getCurrentSectors();
  const currentIdArray = new Set(
    current.map((sec) => {
      return sec.fieldData.slug;
    }),
  );
  return getFilteredFundings()
    .filter((i) => {
      return !currentIdArray.has(i.id);
    })
    .map((i) => {
      return getFundingFromMd(i, sectors);
    });
};

const getUnUsedFundings = async (): Promise<WebflowItem<WebflowFundingFieldData>[]> => {
  const current = await getCurrentFundings();
  const overLap = getOverlappingFundingsFunc(current);
  return current.filter((item) => {
    return !overLap.includes(item);
  });
};

const deleteFundings = async (): Promise<void> => {
  const fundings = await getUnUsedFundings();
  const deleteFunding = async (funding: WebflowItem<WebflowFundingFieldData>): Promise<void> => {
    console.info(`Attempting to delete ${funding.fieldData.slug}`);
    try {
      await deleteItem(funding.id, fundingCollectionId);
    } catch (error) {
      await catchRateLimitErrorAndRetry(error, deleteItem, funding.id, fundingCollectionId);
    }
  };

  const fundingPromises = fundings.map((item): (() => Promise<void>) => {
    return (): Promise<void> => deleteFunding(item);
  });
  await resolveApiPromises(fundingPromises);
};

const updateFundings = async (): Promise<void> => {
  const sectors = await getCurrentSectors();
  const fundings = getFilteredFundings();
  const overlappingFundings = await getOverlappingFundings();

  const modify = async (item: WebflowItem<WebflowFundingFieldData>): Promise<void> => {
    const funding = getFundingFromMd(
      fundings.find((i) => {
        return i.id === item.fieldData.slug;
      })!,
      sectors,
    );
    console.info(`Attempting to modify ${funding.slug}`);
    try {
      await modifyItem(item.id, fundingCollectionId, funding as unknown as Record<string, unknown>);
    } catch (error) {
      await catchRateLimitErrorAndRetry(
        error,
        modifyItem,
        item.id,
        fundingCollectionId,
        funding as unknown as Record<string, unknown>,
      );
    }
  };

  const fundingsPromises = overlappingFundings.map((item): (() => Promise<void>) => {
    return (): Promise<void> => modify(item);
  });

  await resolveApiPromises(fundingsPromises);
};

const createNewFundings = async (): Promise<void> => {
  const newFundings = await getNewFundings();
  const create = async (funding: WebflowFundingFieldData): Promise<void> => {
    console.info(`Attempting to create ${funding.slug}`);
    try {
      await createItem(funding as unknown as Record<string, unknown>, fundingCollectionId, false);
    } catch (error) {
      await catchRateLimitErrorAndRetry(
        error,
        createItem,
        funding as unknown as Record<string, unknown>,
        fundingCollectionId,
        false,
      );
    }
  };

  const fundingPromises = newFundings.map((item): (() => Promise<void>) => {
    return (): Promise<void> => create(item);
  });

  await resolveApiPromises(fundingPromises);
};

const getSectors = (): SectorType[] => {
  return (JSON.parse(fs.readFileSync(path.join(sectorDir, "sectors.json"), "utf8")) as SectorsJson)
    .arrayOfSectors;
};

const getCurrentSectors = async (): Promise<WebflowItem<WebflowSectorFieldData>[]> => {
  return await getAllItems<WebflowSectorFieldData>(sectorCollectionId);
};

const getOverlappingSectorsFunc = (
  currentSectors: WebflowItem<WebflowSectorFieldData>[],
): WebflowItem<WebflowSectorFieldData>[] => {
  return currentSectors.filter((item) => {
    return new Set(
      getSectors().map((item) => {
        return item.id;
      }),
    ).has(item.fieldData.slug);
  });
};

const getOverlappingSectors = async (): Promise<WebflowItem<WebflowSectorFieldData>[]> => {
  return getOverlappingSectorsFunc(await getCurrentSectors());
};

const getUpdatedSectors = async (): Promise<WebflowItem<WebflowSectorFieldData>[]> => {
  const sectorNames = new Set(
    getSectors().map((item) => {
      return item.name;
    }),
  );
  const overlappingSectors = await getOverlappingSectors();

  return overlappingSectors.filter((item) => {
    return !sectorNames.has(item.fieldData.name);
  });
};

const getNewSectors = async (): Promise<WebflowSector[]> => {
  const current = await getCurrentSectors();
  const currentIdArray = new Set(current.map((sec) => sec.fieldData.slug));
  return getSectors()
    .filter((i) => {
      return !currentIdArray.has(i.id);
    })
    .map((i) => {
      return { name: i.name, slug: i.id };
    });
};

const getUnUsedSectors = async (): Promise<WebflowItem<WebflowSectorFieldData>[]> => {
  const current = await getCurrentSectors();
  const overLap = getOverlappingSectorsFunc(current);
  return current.filter((item) => {
    return !(overLap.includes(item) || item.id === allIndustryId);
  });
};

const getUpdatedSectorNames = async (): Promise<WebflowItem<WebflowSectorFieldData>[]> => {
  const sectors = getSectors();
  const updatedSectors = await getUpdatedSectors();
  return updatedSectors.map((item) => {
    return {
      ...item,
      fieldData: {
        ...item.fieldData,
        name: sectors.find((sector) => sector.id === item.fieldData.slug)!.name,
      },
    };
  });
};

const getSortedSectors = async (): Promise<
  Array<WebflowItem<WebflowSectorFieldData> & { rank: number }>
> => {
  const current = await getCurrentSectors();
  const allIndustryItem = current.find((item) => item.id === allIndustryId);
  const overlappingSectorsOrdered = [
    ...orderBy(getOverlappingSectorsFunc(current), ["fieldData.name"], "asc"),
  ];

  return [allIndustryItem!, ...overlappingSectorsOrdered].map((e, i) => {
    return {
      ...e,
      rank: i + 1,
    };
  });
};

const deleteSectors = async (): Promise<void> => {
  const unUsedSectors = await getUnUsedSectors();
  await Promise.all(
    unUsedSectors.map((item) => {
      console.info(`Attempting to delete ${item.fieldData.name}`);
      return deleteItem(item.id, sectorCollectionId);
    }),
  );
};

const updateSectorNames = async (): Promise<void> => {
  const updatedSectorNames = await getUpdatedSectorNames();
  await Promise.all(
    updatedSectorNames.map((item) => {
      console.info(`Attempting to modify ${item.fieldData.name}`);
      return modifyItem(item.id, sectorCollectionId, { name: item.fieldData.name });
    }),
  );
};

const createNewSectors = async (): Promise<void> => {
  const newSectors = await getNewSectors();
  await Promise.all(
    newSectors.map((item) => {
      console.info(`Attempting to create ${item.name}`);
      return createItem(item as unknown as Record<string, unknown>, sectorCollectionId, false);
    }),
  );
};

const reSortSectors = async (): Promise<void> => {
  const sortedSectors = await getSortedSectors();
  await Promise.all(
    sortedSectors.map((item) => {
      console.info(`Attempting to sort ${item.fieldData.name}`);
      return modifyItem(item.id, sectorCollectionId, { rank: item.rank });
    }),
  );
};

const syncSectors = async (): Promise<void> => {
  console.log("deleting unused sectors");
  await deleteSectors();
  console.log("updating renamed sectors");
  await wait();
  await updateSectorNames();
  console.log("creating new sectors");
  await wait();
  await createNewSectors();
  console.log("updating sectors order");
  await wait();
  await reSortSectors();
  console.log("Complete Sectors Sync!");
};

const syncFundings = async (): Promise<void> => {
  console.log("deleting unused fundings");
  await deleteFundings();
  console.log("updating fundings");
  await updateFundings();
  console.log("creating new fundings");
  await createNewFundings();
  console.log("Complete Funding Sync!");
};

/* eslint-disable unicorn/no-process-exit */
// eslint-disable-next-line no-empty
const main = async (): Promise<void> => {
  await syncSectors();
  await syncFundings();
  process.exit(0);
};

(async () => {
  await main();
})();

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
