import fs from "fs";
import {
  LicenseData,
  loadAllLicenses,
  loadAllNavigatorLicenses,
  loadAllNavigatorWebflowLicenses,
  loadNavigatorLicense,
  writeMarkdownString,
} from "../licenseLoader";
import {
  argsInclude,
  catchRateLimitErrorAndRetry,
  contentToStrings,
  getHtml,
  resolveApiPromises,
  wait,
} from "./helpers";
import { LicenseClassificationLookup } from "./licenseClassifications";
import { createItem, deleteItem, getAllItems, modifyItem } from "./methods";
import {WebflowItem, WebflowLicenseData, WebflowLicenseDataFieldData} from "./types";
import { licenseCollectionId } from "./webflowIds";
import {LookupIndustryById} from "@businessnjgovnavigator/shared/industry";
import {LookupTaskAgencyById} from "@businessnjgovnavigator/shared/taskAgency";


const getLicenseDataFromMd = (licenseMd: LicenseData): [string | undefined, WebflowLicenseData] => {
  let name = licenseMd.name;
  if (licenseMd.webflowName !== undefined) {
    name = licenseMd.webflowName;
  }

  const removeValueWithSpecialChars = (value?: string): string => {
    if (!value || value.includes("$")) {
      return "";
    }
    return value.trim();
  };

  return [
    licenseMd.webflowId,
    {
      name: name,
      slug: licenseMd.urlSlug,
      website: removeValueWithSpecialChars(licenseMd.callToActionLink),
      "call-to-action-text": licenseMd.callToActionText || "",
      "department-3": LookupTaskAgencyById(licenseMd.agencyId || "").name,
      division: licenseMd.agencyAdditionalContext || "",
      "department-phone-2": licenseMd.divisionPhone || "",
      "license-certification-classification": licenseMd.licenseCertificationClassification,
      "form-name": licenseMd.formName || "",
      "primary-industry": licenseMd.industryId
        ? LookupIndustryById(licenseMd.industryId).name
        : licenseMd.webflowIndustry || "",
      content: "",
      "last-updated": new Date(Date.now()).toISOString(),
      "license-classification": licenseMd.webflowType
        ? LicenseClassificationLookup[
            licenseMd.webflowType as keyof typeof LicenseClassificationLookup
          ]
        : undefined,
      "summary-description": getHtml(contentToStrings(licenseMd.summaryDescriptionMd || "")),
    },
  ];
};

const getAllLicenseDatasFromWebflow = async (): Promise<WebflowItem<WebflowLicenseDataFieldData>[]> => {
  return await getAllItems<WebflowLicenseDataFieldData>(licenseCollectionId);
};

//  returns list of LicenseData MD loaded from navigator license-tasks folder
const getLicenseDatasAlreadyInWebflow = async (): Promise<LicenseData[]> => {
  const allLicenseDatas = await getAllLicenseDatasFromWebflow();
  const currentLicenseDatasInWebflowIds = new Set(allLicenseDatas.map((it) => it.id));
  const currentLicenseDatasInNavigator = loadAllNavigatorLicenses();

  return currentLicenseDatasInNavigator.filter(
    (it) => it.webflowId !== undefined && currentLicenseDatasInWebflowIds.has(it.webflowId),
  );
};

//  returns list of LicenseData MD loaded from navigator webflow-licenses folder
const getWebflowLicenseDatasAlreadyInWebflow = async (): Promise<LicenseData[]> => {
  const allLicenseDatas = await getAllLicenseDatasFromWebflow();
  const currentLicenseDatasInWebflowIds = new Set(allLicenseDatas.map((it) => it.id));
  const currentWebflowLicenseDatasInNavigator = loadAllNavigatorWebflowLicenses();

  return currentWebflowLicenseDatasInNavigator.filter(
    (it) => it.webflowId !== undefined && currentLicenseDatasInWebflowIds.has(it.webflowId),
  );
};

//CAN WE REMOVE THE COMMENT BELOW? IS THIS STILL TRUE?
// returns a list of license MD objects that don't yet exist in webflow
const getNewLicenseDatas = async (): Promise<LicenseData[]> => {
  const currentLicenseDatasInNavigator = loadAllLicenses();
  const allLicenseDatas = await getAllLicenseDatasFromWebflow();
  const currentLicenseDatasInWebflowIds = new Set(allLicenseDatas.map((it) => it.id));

  //CAN WE REMOVE THE COMMENT BELOW? IS THIS STILL TRUE?
  // right now only syncs license-tasks, not yet webflow-licenses also
  return currentLicenseDatasInNavigator.filter(
    (it) => it.webflowId === undefined || !currentLicenseDatasInWebflowIds.has(it.webflowId),
  );
};

const updateLicenseDatas = async (licenseMarkdowns: LicenseData[]): Promise<void> => {
  const modify = async (licenseMd: LicenseData): Promise<void> => {
    console.info(`Attempting to modify ${licenseMd.urlSlug}`);
    const [webflowItemId, webflowItem] = getLicenseDataFromMd(licenseMd);
    try {
      await modifyItem(
        webflowItemId!,
        licenseCollectionId,
        webflowItem as unknown as Record<string, unknown>,
      );
    } catch (error) {
      await catchRateLimitErrorAndRetry(
        error,
        modifyItem,
        webflowItemId!,
        licenseCollectionId,
        webflowItem as unknown as Record<string, unknown>,
      );
    }
  };

  const licensePromises = licenseMarkdowns.map((item): (() => Promise<void>) => {
    return (): Promise<void> => modify(item);
  });

  await resolveApiPromises(licensePromises);

  console.info(`Modified a total of ${licenseMarkdowns.length} licenses`);
};

const updateLicenseDataWithWebflowId = (webflowId: string, id: string): void => {
  const [mdObject, filepath] = loadNavigatorLicense(`${id}.md`);
  const updatedMdObject = {
    ...mdObject,
    webflowId: webflowId,
  };
  const stringifiedFile = writeMarkdownString(updatedMdObject);
  fs.writeFileSync(`${filepath}`, stringifiedFile);
};

const createNewLicenseDatas = async (): Promise<void> => {
  const newLicenseDatas = await getNewLicenseDatas();

  const create = async (licenseMd: LicenseData): Promise<void> => {
    console.info(`Attempting to create ${licenseMd.urlSlug}`);
    let result;
    const [, webflowItem] = getLicenseDataFromMd(licenseMd);
    try {
      result = await createItem(
        webflowItem as unknown as Record<string, unknown>,
        licenseCollectionId,
        false,
      );
    } catch (error) {
      await catchRateLimitErrorAndRetry(
        error,
        createItem,
        webflowItem as unknown as Record<string, unknown>,
        licenseCollectionId,
        false,
      );
    }

    if (licenseMd.webflowId === undefined && result) {
      const id = licenseMd.id;
      const webflowId = result.data.data.id;
      updateLicenseDataWithWebflowId(webflowId, id);
    }
    return;
  };

  const licensePromises = newLicenseDatas.map((item): (() => Promise<void>) => {
    return (): Promise<void> => create(item);
  });

  await resolveApiPromises(licensePromises);

  console.info(`Created a total of ${newLicenseDatas.length} licenses`);
};

const getUnusedLicenseDataIds = async (): Promise<WebflowItem<WebflowLicenseDataFieldData>[]> => {
  const localLicenseDatasRaw = loadAllLicenses();
  const localLicenseDatasWithWebflowIds = localLicenseDatasRaw.filter((it) => it.webflowId !== undefined);
  const localLicenseDatasIds = new Set(localLicenseDatasWithWebflowIds.map((it) => it.webflowId));

  const webflowLicenseDataArray = await getAllLicenseDatasFromWebflow();

  return webflowLicenseDataArray.filter((item) => {
    const hasValueInLocalCmsAndWebflowRemote = localLicenseDatasIds.has(item.id);
    return !hasValueInLocalCmsAndWebflowRemote;
  });
};

const deleteLicenseDatas = async (): Promise<void> => {
  const licenses = await getUnusedLicenseDataIds();
  const deleteLicenseData = async (license: WebflowItem<WebflowLicenseDataFieldData>): Promise<void> => {
    console.info(`Attempting to delete unused license: ${license.fieldData.slug}`);
    try {
      await deleteItem(license.id, licenseCollectionId);
    } catch (error) {
      await catchRateLimitErrorAndRetry(error, deleteItem, license.id, licenseCollectionId);
    }
  };

  const licensePromises = licenses.map((item): (() => Promise<void>) => {
    return (): Promise<void> => deleteLicenseData(item);
  });
  await resolveApiPromises(licensePromises);
};

const syncLicenseDatas = async (params: { create: boolean }): Promise<void> => {
  console.log("deleting licenses");
  await deleteLicenseDatas();
  await wait();
  console.log("updating licenses");
  const licensesAlreadyInWebflow = await getLicenseDatasAlreadyInWebflow();
  await updateLicenseDatas(licensesAlreadyInWebflow);
  console.log("updating webflow-licenses");
  const webflowLicenseDatasToUpdate = await getWebflowLicenseDatasAlreadyInWebflow();
  await updateLicenseDatas(webflowLicenseDatasToUpdate);
  console.log("creating new licenses (no new webflow-licenses will be created)");
  await wait();
  if (params.create) {
    await createNewLicenseDatas();
    console.log("Complete license sync!");
  }
};

const main = async (): Promise<void> => {
  if (process.env.NODE_ENV === "test") {
    // intentionally empty
  } else if (argsInclude("--sync")) {
    await syncLicenseDatas({ create: true });
  } else if (argsInclude("--ci-sync")) {
    await syncLicenseDatas({ create: false });
  } else if (argsInclude("--legacy-sync")) {
    const webflowLicenseDatasToUpdate = await getWebflowLicenseDatasAlreadyInWebflow();
    await updateLicenseDatas(webflowLicenseDatasToUpdate);
  } else if (argsInclude("--preview")) {
    console.info("---- To be deleted: -----");
    const unusedIds = await getUnusedLicenseDataIds();
    console.info(unusedIds.map((it) => `${it.fieldData.name}: ${it.id}`));
    console.info("---- To be created: -----");
    const newLicenseDatas = await getNewLicenseDatas();
    console.info(newLicenseDatas.map((it) => it.name));
    console.info("---- To be updated: -----");
    const existingLicenseDatas = await getLicenseDatasAlreadyInWebflow();
    console.info(existingLicenseDatas.map((it) => it.name));
  } else if (argsInclude("--legacy-preview")) {
    console.info("---- To be updated: -----");
    const webflowLicenseDatas = await getWebflowLicenseDatasAlreadyInWebflow();
    console.info(webflowLicenseDatas.map((it) => it.id));
  } else {
    console.log("Expected at least one argument! Use one of the following: ");
    console.log("--sync =  Syncs licenses");
    console.log("--preview = Preview LicenseDatas to Create and Update");
    throw new Error("Invalid arguments");
  }
};

await main();

export {};
