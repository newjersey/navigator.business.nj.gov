import { Industry } from "@businessnjgovnavigator/shared/industry";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { catchRateLimitErrorAndRetry, resolveApiPromises } from "./helpers";
import { createItem, getAllItems, modifyItem } from "./methods";
import { WebflowIndustryName, WebflowItem } from "./types";
import { industryNameCollectionId } from "./webflowIds";

const navigatorIndustryDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/roadmaps/industries`,
);

const getAllIndustryNamesFromWebflow = async (): Promise<WebflowItem[]> => {
  return await getAllItems(industryNameCollectionId);
};

const industriesObject = ((): Industry[] => {
  const industryFileNames = fs.readdirSync(navigatorIndustryDir);
  return industryFileNames.map((industryFileName) => {
    const fullPath = path.join(navigatorIndustryDir, industryFileName);
    return JSON.parse(fs.readFileSync(fullPath, "utf8")) as Industry;
  });
})();

const getIndustryNamesAlreadyInWebflow = async (): Promise<Industry[]> => {
  const allIndustryNames = await getAllIndustryNamesFromWebflow();
  const currentIndustryNamesInWebflowIds = allIndustryNames.map((it) => it.id);

  if (currentIndustryNamesInWebflowIds.length > industriesObject.length) {
    const webflowIdsNotInNavigator = currentIndustryNamesInWebflowIds.filter((id) => {
      for (const industry of industriesObject) {
        if (industry.webflowId !== undefined && industry.webflowId === id) {
          return false;
        }
      }
      return true;
    });

    console.error(
      `Industry sync cancelled.\n\nThere are more industry names in Webflow than industries in The Navigator. This may indicate a problem with the sync.\n\nThe following webflowIds are not associated with a known industry in The Navigator:\n\n${webflowIdsNotInNavigator}`,
    );
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }

  return industriesObject.filter(
    (it) => it.webflowId !== undefined && currentIndustryNamesInWebflowIds.includes(it.webflowId),
  );
};

const getNewIndustries = async (): Promise<Industry[]> => {
  const allIndustryNames = await getAllIndustryNamesFromWebflow();
  const currentIndustryNamesInWebflowIds = new Set(allIndustryNames.map((it) => it.id));

  return industriesObject.filter(
    (it) =>
      (it.webflowId === undefined || !currentIndustryNamesInWebflowIds.has(it.webflowId)) &&
      it.isEnabled,
  );
};

const convertIndustryToWebflowIndustryName = (industry: Industry): WebflowIndustryName => {
  return {
    name: industry.name,
    slug: industry.id,
    additionalsearchterms: industry.additionalSearchTerms,
    description: industry.description,
    industryquerystring: industry.id,
  };
};

const updateWebflowIndustryNames = async (industries: Industry[]): Promise<void> => {
  const modify = async (industry: Industry): Promise<void> => {
    console.info(`Attempting to modify ${industry.name}`);
    const webflowIndustryName = convertIndustryToWebflowIndustryName(industry);
    try {
      await modifyItem(
        industry.webflowId!,
        industryNameCollectionId,
        webflowIndustryName as unknown as Record<string, unknown>,
      );
    } catch (error) {
      await catchRateLimitErrorAndRetry(
        error,
        modifyItem,
        industry.webflowId!,
        industryNameCollectionId,
        webflowIndustryName as unknown as Record<string, unknown>,
      );
    }
  };

  const industryPromises = industries.map((industry): (() => Promise<void>) => {
    return (): Promise<void> => modify(industry);
  });

  await resolveApiPromises(industryPromises);

  console.info(`Modified a total of ${industries.length} Webflow Industry Names`);
};

const loadNavigatorIndustry = (fileName: string): Industry => {
  const fullPath = path.join(navigatorIndustryDir, `${fileName}`);
  const content = fs.readFileSync(fullPath, "utf8");
  const industry = JSON.parse(content) as Industry;
  return industry;
};

const updateIndustryWithWebflowId = (webflowId: string, filename: string): void => {
  const industry = loadNavigatorIndustry(`${filename}.json`);
  const updatedIndustry = {
    ...industry,
    webflowId,
  };
  const jsonString = JSON.stringify(updatedIndustry, null, 2);

  fs.writeFileSync(`${navigatorIndustryDir}/${filename}.json`, jsonString);
};

const createNewWebflowIndustryNames = async (): Promise<void> => {
  const newIndustries = await getNewIndustries();

  const create = async (industry: Industry): Promise<void> => {
    console.info(`Attempting to create ${industry.name}`);
    let result;
    const webflowIndustryName = convertIndustryToWebflowIndustryName(industry);
    try {
      result = await createItem(
        webflowIndustryName as unknown as Record<string, unknown>,
        industryNameCollectionId,
        false,
      );
    } catch (error) {
      await catchRateLimitErrorAndRetry(
        error,
        createItem,
        webflowIndustryName as unknown as Record<string, unknown>,
        industryNameCollectionId,
        false,
      );
    }

    if (industry.webflowId === undefined && result) {
      const filename = industry.id;
      const webflowId = result.data.data.id;
      updateIndustryWithWebflowId(webflowId, filename);
    }
    return;
  };

  const industryPromises = newIndustries.map((industry): (() => Promise<void>) => {
    return (): Promise<void> => create(industry);
  });

  await resolveApiPromises(industryPromises);

  console.info(`Created a total of ${newIndustries.length} Webflow Industry Names`);
};

const syncIndustries = async (): Promise<void> => {
  console.log("updating industry names");
  const industriesAlreadyInWebflow = await getIndustryNamesAlreadyInWebflow();

  await updateWebflowIndustryNames(industriesAlreadyInWebflow);
  console.log("creating new industry names");

  await createNewWebflowIndustryNames();
  console.log("Complete industry sync!");
};

const main = async (): Promise<void> => {
  await syncIndustries();
};

(async () => {
  await main();
})();

export {};
