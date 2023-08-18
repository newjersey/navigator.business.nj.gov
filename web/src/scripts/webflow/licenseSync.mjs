/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-undef */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import industryJson from "../../../../content/lib/industry.json" assert { type: "json" };
import taskAgenciesJSON from "../../../../content/src/mappings/taskAgency.json" assert { type: "json" };
import {
  loadAllLicenses,
  loadAllNavigatorLicenses,
  loadAllNavigatorWebflowLicenses,
  loadNavigatorLicense,
  writeMarkdownString
} from "../licenseLoader.mjs";
import { argsInclude, contentToStrings, getHtml, wait } from "./helpers.mjs";
import { LicenseClassificationLookup } from "./licenseClassifications.mjs";
import { createItem, getAllItems, modifyItem } from "./methods.mjs";

const licenseCollectionId = "5e31b06cb76b830c0c358aa8";

export const LookupTaskAgencyById = (id) => {
  return (
    taskAgenciesJSON.arrayOfTaskAgencies.find((x) => {
      return x.id === id;
    }) ?? {
      id: "",
      name: ""
    }
  );
};

const LookupIndustryById = (id) => {
  return (
    industryJson.industries.find((x) => {
      return x.id === id;
    }) ?? {
      id: "",
      name: "",
      description: "",
      canHavePermanentLocation: true,
      roadmapSteps: [],
      naicsCodes: "",
      isEnabled: false,
      industryOnboardingQuestions: {
        isProvidesStaffingServicesApplicable: undefined,
        isCertifiedInteriorDesignerApplicable: undefined,
        isRealEstateAppraisalManagementApplicable: undefined,
        canBeReseller: undefined,
        canBeHomeBased: undefined,
        isLiquorLicenseApplicable: undefined,
        isCpaRequiredApplicable: undefined,
        isTransportation: undefined,
        isCarServiceApplicable: undefined,
        isInterstateLogisticsApplicable: undefined,
        isInterstateMovingApplicable: undefined,
        isChildcareForSixOrMore: undefined,
        willSellPetCareItems: undefined,
        isPetCareHousingApplicable: undefined
      }
    }
  );
};

const getLicenseFromMd = (licenseMd) => {
  let name = licenseMd.name;
  if (licenseMd.webflowName !== undefined) {
    name = licenseMd.webflowName;
  }

  const removeValueWithSpecialChars = (value) => {
    if (!value || value.includes("$")) {
      return "";
    }
    return value;
  };

  return {
    _id: licenseMd.webflowId,
    name: name,
    slug: licenseMd.urlSlug,
    website: removeValueWithSpecialChars(licenseMd.callToActionLink),
    "call-to-action-text": licenseMd.callToActionText,
    "department-3": LookupTaskAgencyById(licenseMd.agencyId).name,
    division: licenseMd.agencyAdditionalContext,
    "department-phone-2": licenseMd.divisionPhone,
    "license-certification-classification": licenseMd.licenseCertificationClassification,
    "form-name": licenseMd.formName,
    "primary-industry": licenseMd.industryId
      ? LookupIndustryById(licenseMd.industryId).name
      : licenseMd.webflowIndustry,
    content: getHtml(contentToStrings(licenseMd.contentMd)),
    "last-updated": new Date(Date.now()).toISOString(),
    "license-classification": licenseMd.webflowType
      ? LicenseClassificationLookup[licenseMd.webflowType]
      : undefined,
    "summary-description": getHtml(contentToStrings(licenseMd.summaryDescriptionMd))
  };
};

const getAllLicensesFromWebflow = async () => {
  return await getAllItems(licenseCollectionId);
};

//  returns list of License MD loaded from navigator license-tasks folder
const getLicensesAlreadyInWebflow = async () => {
  const currentLicensesInWebflowIds = (await getAllLicensesFromWebflow()).map((it) => it._id);
  const currentLicensesInNavigator = loadAllNavigatorLicenses();

  return currentLicensesInNavigator.filter(
    (it) => it.webflowId !== undefined && currentLicensesInWebflowIds.includes(it.webflowId)
  );
};

//  returns list of License MD loaded from navigator webflow-licenses folder
const getWebflowLicensesAlreadyInWebflow = async () => {
  const currentLicensesInWebflowIds = (await getAllLicensesFromWebflow()).map((it) => it._id);
  const currentWebflowLicensesInNavigator = loadAllNavigatorWebflowLicenses();

  return currentWebflowLicensesInNavigator.filter(
    (it) => it.webflowId !== undefined && currentLicensesInWebflowIds.includes(it.webflowId)
  );
};

// returns a list of license MD objects that don't yet exist in webflow
const getNewLicenses = async () => {
  const currentLicensesInNavigator = loadAllLicenses();
  const currentLicensesInWebflowIds = (await getAllLicensesFromWebflow()).map((it) => it._id);

  // right now only syncs license-tasks, not yet webflow-licenses also
  return currentLicensesInNavigator.filter(
    (it) => it.webflowId === undefined || !currentLicensesInWebflowIds.includes(it.webflowId)
  );
};

const updateLicenses = async (licenseMarkdowns) => {
  const modify = async (licenseMd) => {
    console.info(`Attempting to modify ${licenseMd.urlSlug}`);
    try {
      const webflowItem = getLicenseFromMd(licenseMd);
      return await modifyItem(webflowItem._id, licenseCollectionId, webflowItem);
    } catch (error) {
      console.error(error.response);
      throw error;
    }
  };

  await Promise.all(
    licenseMarkdowns.map(async (item) => {
      return await modify(item);
    })
  );

  console.info(`Modified a total of ${licenseMarkdowns.length} licenses`);
};

const updateLicenseWithWebflowId = (webflowId, filename) => {
  const mdObject = loadNavigatorLicense(`${filename}.md`);
  const updatedMdObject = {
    ...mdObject,
    webflowId: webflowId
  };
  const stringifiedFile = writeMarkdownString(updatedMdObject);

  const outDir = `${path.dirname(
    fileURLToPath(import.meta.url)
  )}/../../../../content/src/roadmaps/license-tasks`;
  fs.writeFileSync(`${outDir}/${filename}.md`, stringifiedFile, (err) => {
    if (err) {
      throw err;
    }
  });
};

const createNewLicenses = async () => {
  const newLicenses = await getNewLicenses();

  const create = async (licenseMd) => {
    console.info(`Attempting to create ${licenseMd.urlSlug}`);
    let result;
    try {
      const webflowItem = getLicenseFromMd(licenseMd);
      result = await createItem(webflowItem, licenseCollectionId, false);
    } catch (error) {
      console.error(error.response);
      throw error;
    }

    if (licenseMd.webflowId === undefined) {
      const filename = licenseMd.filename;
      const webflowId = result.data._id;
      updateLicenseWithWebflowId(webflowId, filename);
    }
    return Promise.resolve();
  };

  await Promise.all(
    newLicenses.map(async (item) => {
      return await create(item);
    })
  );

  console.info(`Created a total of ${newLicenses.length} licenses`);
};

const syncLicenses = async (params) => {
  console.log("updating licenses");
  await wait();
  const licensesAlreadyInWebflow = await getLicensesAlreadyInWebflow();
  await updateLicenses(licensesAlreadyInWebflow);
  console.log("creating new licenses");
  await wait();
  if (params.create) {
    await createNewLicenses();
    console.log("Complete license sync!");
  }
};

// eslint-disable-next-line no-empty
if (process.env.NODE_ENV === "test") {
  // intentionally empty
} else if (argsInclude("--sync")) {
  await (async () => {
    await syncLicenses({ create: true });
    process.exit(0);
  })();
} else if (argsInclude("--ci-sync")) {
  await (async () => {
    await syncLicenses({ create: false });
    process.exit(0);
  })();
} else if (argsInclude("--legacy-sync")) {
  await (async () => {
    const webflowLicensesToUpdate = await getWebflowLicensesAlreadyInWebflow();
    const x = webflowLicensesToUpdate.slice(600, 700);
    await updateLicenses(x);
    process.exit(0);
  })();
} else if (argsInclude("--preview")) {
  await (async () => {
    console.info("---- To be created: -----");
    console.info((await getNewLicenses()).map((it) => it.filename));
    console.info("---- To be updated: -----");
    console.info((await getLicensesAlreadyInWebflow()).map((it) => it.filename));
    process.exit(0);
  })();
} else if (argsInclude("--legacy-preview")) {
  await (async () => {
    console.info("---- To be updated: -----");
    console.info((await getWebflowLicensesAlreadyInWebflow()).map((it) => it.filename));
    process.exit(0);
  })();
} else {
  console.log("Expected at least one argument! Use one of the following: ");
  console.log("--sync =  Syncs licenses");
  console.log("--preview = Preview Licenses to Create and Update");
  process.exit(1);
}
export {};
