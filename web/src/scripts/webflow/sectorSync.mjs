/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-undef */
import fs from "fs";
import orderBy from "lodash";
import path from "path";
import { fileURLToPath } from "url";
import { wait } from "./helpers2.mjs";
import { createItem, deleteItem, getAllItems, modifyItem } from "./methods.mjs";
import { allIndustryId, sectorCollectionId } from "./webflowIds.mjs";

const isNotTestEnv = process.env.NODE_ENV !== "test";

const sectorDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/mappings`
);
const getSectors = () => {
  return JSON.parse(fs.readFileSync(path.join(sectorDir, "sectors.json"), "utf8")).arrayOfSectors;
};

const getCurrentSectors = async () => {
  return await getAllItems(sectorCollectionId);
};

const getOverlappingSectorsFunc = (currentSectors) => {
  return currentSectors.filter((item) => {
    return new Set(
      getSectors().map((item) => {
        return item.id;
      })
    ).has(item.fieldData.slug);
  });
};

const getOverlappingSectors = async () => {
  return getOverlappingSectorsFunc(await getCurrentSectors());
};

const getUpdatedSectors = async () => {
  const sectorNames = new Set(
    getSectors().map((item) => {
      return item.name;
    })
  );
  const overlappingSectors = await getOverlappingSectors();

  return overlappingSectors.filter((item) => {
    return !sectorNames.has(item.fieldData.name);
  });
};

const getNewSectors = async () => {
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

const getUnUsedSectors = async () => {
  const current = await getCurrentSectors();
  const overLap = getOverlappingSectorsFunc(current);
  return current.filter((item) => {
    return !(overLap.includes(item) || item.id === allIndustryId);
  });
};

const getUpdatedSectorNames = async () => {
  const sectors = getSectors();
  const updatedSectors = await getUpdatedSectors();
  return updatedSectors.map((item) => {
    return {
      ...item,
      fieldData: {
        ...item.fieldData,
        name: sectors.find((sector) => sector.id === item.fieldData.slug).name,
      },
    };
  });
};

const getSortedSectors = async () => {
  const current = await getCurrentSectors();
  const allIndustryItem = current.find((item) => item.id === allIndustryId);
  const overlappingSectorsOrdered = [
    ...orderBy(getOverlappingSectorsFunc(current), ["fieldData.name"], "asc"),
  ];

  return [allIndustryItem, ...overlappingSectorsOrdered].map((e, i) => {
    return {
      ...e,
      rank: i + 1,
    };
  });
};

const deleteSectors = async () => {
  const unUsedSectors = await getUnUsedSectors();
  return unUsedSectors.map((item) => {
    isNotTestEnv && console.info(`Attempting to delete ${item.fieldData.name}`);
    return deleteItem(item.id, sectorCollectionId);
  });
};

const updateSectorNames = async () => {
  const updatedSectorNames = await getUpdatedSectorNames();
  return updatedSectorNames.map((item) => {
    isNotTestEnv && console.info(`Attempting to modify ${item.fieldData.name}`);
    return modifyItem(item.id, sectorCollectionId, { name: item.fieldData.name });
  });
};

const createNewSectors = async () => {
  const newSectors = await getNewSectors();
  return newSectors.map((item) => {
    isNotTestEnv && console.info(`Attempting to create ${item.name}`);
    return createItem(item, sectorCollectionId, false);
  });
};

const reSortSectors = async () => {
  const sortedSectors = await getSortedSectors();
  return sortedSectors.map((item) => {
    isNotTestEnv && console.info(`Attempting to sort ${item.fieldData.name}`);
    return modifyItem(item.id, sectorCollectionId, { rank: item.rank });
  });
};

const syncSectors = async () => {
  isNotTestEnv && console.log("deleting unused sectors");
  await deleteSectors();
  isNotTestEnv && console.log("updating renamed sectors");
  await wait();
  await updateSectorNames();
  isNotTestEnv && console.log("creating new sectors");
  await wait();
  await createNewSectors();
  isNotTestEnv && console.log("updating sectors order");
  await wait();
  await reSortSectors();
  isNotTestEnv && console.log("Complete Sectors Sync!");
};
export {
  createNewSectors,
  deleteSectors,
  getCurrentSectors,
  getNewSectors,
  getSectors,
  getSortedSectors,
  getUnUsedSectors,
  getUpdatedSectorNames,
  reSortSectors,
  syncSectors,
  updateSectorNames,
};
// eslint-disable-next-line no-empty
if (
  !process.argv.some((i) => {
    return i.includes("sectorSync");
  }) ||
  process.env.NODE_ENV === "test"
) {
  // intentionally empty
} else if (
  process.argv.some((i) => {
    return i.includes("--sync");
  })
) {
  await (async () => {
    await syncSectors();
    process.exit(1);
  })();
} else if (
  process.argv.some((i) => {
    return i.includes("--previewUnused");
  })
) {
  await (async () => {
    isNotTestEnv && console.info(await getUnUsedSectors());
    process.exit(1);
  })();
} else if (
  process.argv.some((i) => {
    return i.includes("--previewCreate");
  })
) {
  await (async () => {
    isNotTestEnv && console.info(await getNewSectors());
    process.exit(1);
  })();
} else if (
  process.argv.some((i) => {
    return i.includes("--previewUpdate");
  })
) {
  await (async () => {
    isNotTestEnv && console.info(await getUpdatedSectorNames());
    process.exit(1);
  })();
} else {
  isNotTestEnv && console.log("Expected at least one argument! Use one of the following: ");
  isNotTestEnv && console.log("--previewUnused = Preview Sectors to Delete");
  isNotTestEnv && console.log("--previewCreate = Preview Sectors to Create");
  isNotTestEnv && console.log("--previewUpdate = Preview Sectors to Update");
  isNotTestEnv && console.log("--sync = Syncs sectors");
}

export { allIndustryId } from "./webflowIds.mjs";
