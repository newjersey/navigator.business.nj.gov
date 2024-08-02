/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-undef */

import fs from "fs";
import industryJson from "../../../../content/lib/industry.json" assert { type: "json" };
import taskAgenciesJSON from "../../../../content/src/mappings/taskAgency.json" assert { type: "json" };
import {
  loadAllLicenses,
  loadAllNavigatorLicenses,
  loadAllNavigatorWebflowLicenses,
  loadNavigatorLicense,
  writeMarkdownString,
} from "../licenseLoader.mjs";
import {
  argsInclude,
  catchRateLimitErrorAndRetry,
  contentToStrings,
  getHtml,
  resolveApiPromises,
} from "./helpers.mjs";
import { wait } from "./helpers2.mjs";
import { LicenseClassificationLookup } from "./licenseClassifications.mjs";
import { createItem, deleteItem, getAllItems, modifyItem } from "./methods.mjs";
import { licenseCollectionId } from "./webflowIds.mjs";

export const LookupTaskAgencyById = (id) => {
  return (
    taskAgenciesJSON.arrayOfTaskAgencies.find((x) => {
      return x.id === id;
    }) ?? {
      id: "",
      name: "",
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
        isPetCareHousingApplicable: undefined,
      },
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

  return [
    licenseMd.webflowId,
    {
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
      "summary-description": getHtml(contentToStrings(licenseMd.summaryDescriptionMd)),
    },
  ];
};

const getAllLicensesFromWebflow = async () => {
  return await getAllItems(licenseCollectionId);
};

//  returns list of License MD loaded from navigator license-tasks folder
const getLicensesAlreadyInWebflow = async () => {
  const currentLicensesInWebflowIds = new Set((await getAllLicensesFromWebflow()).map((it) => it.id));
  const currentLicensesInNavigator = loadAllNavigatorLicenses();

  return currentLicensesInNavigator.filter(
    (it) => it.webflowId !== undefined && currentLicensesInWebflowIds.has(it.webflowId)
  );
};

//  returns list of License MD loaded from navigator webflow-licenses folder
const getWebflowLicensesAlreadyInWebflow = async () => {
  const currentLicensesInWebflowIds = new Set((await getAllLicensesFromWebflow()).map((it) => it.id));
  const currentWebflowLicensesInNavigator = loadAllNavigatorWebflowLicenses();

  return currentWebflowLicensesInNavigator.filter(
    (it) => it.webflowId !== undefined && currentLicensesInWebflowIds.has(it.webflowId)
  );
};

//CAN WE REMOVE THE COMMENT BELOW? IS THIS STILL TRUE?
// returns a list of license MD objects that don't yet exist in webflow
const getNewLicenses = async () => {
  const currentLicensesInNavigator = loadAllLicenses();
  const currentLicensesInWebflowIds = new Set((await getAllLicensesFromWebflow()).map((it) => it.id));

  //CAN WE REMOVE THE COMMENT BELOW? IS THIS STILL TRUE?
  // right now only syncs license-tasks, not yet webflow-licenses also
  return currentLicensesInNavigator.filter(
    (it) => it.webflowId === undefined || !currentLicensesInWebflowIds.has(it.webflowId)
  );
};

const updateLicenses = async (licenseMarkdowns) => {
  const modify = async (licenseMd) => {
    console.info(`Attempting to modify ${licenseMd.urlSlug}`);
    const [webflowItemId, webflowItem] = getLicenseFromMd(licenseMd);
    try {
      return await modifyItem(webflowItemId, licenseCollectionId, webflowItem);
    } catch (error) {
      await catchRateLimitErrorAndRetry(error, modifyItem, webflowItemId, licenseCollectionId, webflowItem);
    }
  };

  const licensePromises = licenseMarkdowns.map((item) => {
    return () => modify(item);
  });

  await resolveApiPromises(licensePromises);

  console.info(`Modified a total of ${licenseMarkdowns.length} licenses`);
};

const updateLicenseWithWebflowId = (webflowId, filename) => {
  const [mdObject, filepath] = loadNavigatorLicense(`${filename}.md`);
  const updatedMdObject = {
    ...mdObject,
    webflowId: webflowId,
  };
  const stringifiedFile = writeMarkdownString(updatedMdObject);
  fs.writeFileSync(`${filepath}`, stringifiedFile, (err) => {
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
    const [webflowItemId, webflowItem] = getLicenseFromMd(licenseMd);
    try {
      result = await createItem(webflowItem, licenseCollectionId, false);
    } catch (error) {
      await catchRateLimitErrorAndRetry(error, createItem, webflowItem, licenseCollectionId, false);
    }

    if (licenseMd.webflowId === undefined) {
      const filename = licenseMd.filename;
      const webflowId = result.data.id;
      updateLicenseWithWebflowId(webflowId, filename);
    }
    return;
  };

  const licensePromises = newLicenses.map((item) => {
    return () => create(item);
  });

  await resolveApiPromises(licensePromises);

  console.info(`Created a total of ${newLicenses.length} licenses`);
};

const getUnusedLicenseIds = async () => {
  const localLicensesRaw = loadAllLicenses();
  const localLicensesWithWebflowIds = localLicensesRaw.filter((it) => it.webflowId !== undefined);
  const localLicensesIds = new Set(localLicensesWithWebflowIds.map((it) => it.webflowId));

  const webflowLicenseArray = await getAllLicensesFromWebflow();

  return webflowLicenseArray.filter((item) => {
    const hasValueInLocalCmsAndWebflowRemote = localLicensesIds.has(item.id);
    return !hasValueInLocalCmsAndWebflowRemote;
  });
};

const deleteLicenses = async () => {
  const licenses = await getUnusedLicenseIds();
  const deleteLicense = async (license) => {
    console.info(`Attempting to delete unused license: ${license.fieldData.slug}`);
    try {
      return await deleteItem(license.id, licenseCollectionId);
    } catch (error) {
      await catchRateLimitErrorAndRetry(error, deleteItem, license.id, licenseCollectionId);
    }
  };

  const licensePromises = licenses.map((item) => {
    return () => deleteLicense(item);
  });
  await resolveApiPromises(licensePromises);
};

const syncLicenses = async (params) => {
  console.log("deleting licenses");
  await deleteLicenses();
  await wait();
  console.log("updating licenses");
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
    console.info("---- To be deleted: -----");
    console.info((await getUnusedLicenseIds()).map((it) => `${it.fieldData.name}: ${it.id}`));
    console.info("---- To be created: -----");
    console.info((await getNewLicenses()).map((it) => it.name));
    console.info("---- To be updated: -----");
    console.info((await getLicensesAlreadyInWebflow()).map((it) => it.name));
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
