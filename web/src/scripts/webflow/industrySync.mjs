/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-undef */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import industryJson from "../../../../content/lib/industry.json" assert { type: "json" };
import { argsInclude } from "./helpers.mjs";
import { createItem, getAllItems, modifyItem } from "./methods.mjs";
import { industryNameCollectionId } from "./webflowIds.mjs";

const navigatorIndustryDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/roadmaps/industries`
);

const getAllIndustryNamesFromWebflow = async () => {
  return await getAllItems(industryNameCollectionId);
};

const getIndustryNamesAlreadyInWebflow = async () => {
  const currentIndustryNamesInWebflowIds = (await getAllIndustryNamesFromWebflow()).map((it) => it.id);
  const currentIndustriesInNavigator = industryJson["industries"];

  if (currentIndustryNamesInWebflowIds.length > currentIndustriesInNavigator.length) {
    const webflowIdsNotInNavigator = currentIndustryNamesInWebflowIds.filter((id) => {
      for (const industry in currentIndustriesInNavigator) {
        if (industry.webflowId !== undefined && industry.webflowId === id) {
          return false;
        }
      }
      return true;
    });

    console.error(
      `Industry sync cancelled.\n\nThere are more industry names in Webflow than industries in The Navigator. This may indicate a problem with the sync.\n\nThe following webflowIds are not associated with a known industry in The Navigator:\n\n${webflowIdsNotInNavigator}`
    );
    process.exit(1);
  }

  return currentIndustriesInNavigator.filter(
    (it) => it.webflowId !== undefined && currentIndustryNamesInWebflowIds.includes(it.webflowId)
  );
};

const getNewIndustries = async () => {
  const currentIndustriesInNavigator = industryJson["industries"];
  const currentIndustryNamesInWebflowIds = new Set(
    (await getAllIndustryNamesFromWebflow()).map((it) => it.id)
  );

  return currentIndustriesInNavigator.filter(
    (it) => it.webflowId === undefined || !currentIndustryNamesInWebflowIds.has(it.webflowId)
  );
};

const convertIndustryToWebflowIndustryName = (industry) => {
  return {
    name: industry.name,
    slug: industry.id,
    additionalsearchterms: industry.additionalSearchTerms,
    description: industry.description,
    industryquerystring: industry.id,
  };
};

const updateWebflowIndustryNames = async (industries) => {
  const modify = async (industry) => {
    console.info(`Attempting to modify ${industry.name}`);
    try {
      const webflowIndustryName = convertIndustryToWebflowIndustryName(industry);
      return await modifyItem(industry.webflowId, industryNameCollectionId, webflowIndustryName);
    } catch (error) {
      console.error(error.response);
      throw error;
    }
  };

  await Promise.all(
    industries.map(async (industry) => {
      return await modify(industry);
    })
  );

  console.info(`Modified a total of ${industries.length} Webflow Industry Names`);
};

const loadNavigatorIndustry = (fileName) => {
  const fullPath = path.join(navigatorIndustryDir, `${fileName}`);
  const content = fs.readFileSync(fullPath, "utf8");
  const industry = JSON.parse(content);
  return industry;
};

const updateIndustryWithWebflowId = (webflowId, filename) => {
  const industry = loadNavigatorIndustry(`${filename}.json`);
  const updatedIndustry = {
    ...industry,
    webflowId,
  };
  const jsonString = JSON.stringify(updatedIndustry, null, 2);

  fs.writeFileSync(`${navigatorIndustryDir}/${filename}.json`, jsonString, (err) => {
    if (err) {
      throw err;
    }
  });
};

const createNewWebflowIndustryNames = async () => {
  const newIndustries = await getNewIndustries();

  const create = async (industry) => {
    console.info(`Attempting to create ${industry.name}`);
    let result;
    try {
      const webflowIndustryName = convertIndustryToWebflowIndustryName(industry);
      result = await createItem(webflowIndustryName, industryNameCollectionId, false);
    } catch (error) {
      console.error(error.response);
      throw error;
    }

    if (industry.webflowId === undefined) {
      const filename = industry.id;
      const webflowId = result.data.id;
      updateIndustryWithWebflowId(webflowId, filename);
    }
    return;
  };

  await Promise.all(
    newIndustries.map(async (industry) => {
      return await create(industry);
    })
  );

  console.info(`Created a total of ${newIndustries.length} Webflow Industry Names`);
};

const syncIndustries = async (params) => {
  console.log("updating industry names");
  const industriesAlreadyInWebflow = await getIndustryNamesAlreadyInWebflow();

  await updateWebflowIndustryNames(industriesAlreadyInWebflow);
  console.log("creating new industry names");

  if (params.create) {
    await createNewWebflowIndustryNames();
    console.log("Complete industry sync!");
  }
};

// eslint-disable-next-line no-empty
if (process.env.NODE_ENV === "test") {
  // intentionally empty
} else if (argsInclude("--sync")) {
  await (async () => {
    await syncIndustries({ create: true });
    process.exit(0);
  })();
} else if (argsInclude("--ci-sync")) {
  await (async () => {
    await syncIndustries({ create: false });
    process.exit(0);
  })();
} else {
  console.log("Expected at least one argument! Use one of the following: ");
  console.log("--sync =  Syncs industries");
  console.log("--ci-sync =  Syncs existing industries; does not add new industries or modify codebase");
  process.exit(1);
}
export {};
