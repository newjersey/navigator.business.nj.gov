import fs from "fs";
import { orderBy } from "lodash";
import path from "path";
import { fileURLToPath } from "url";
import { wait } from "./helpers";
import { createItem, deleteItem, getAllItems, modifyItem } from "./methods";
import {SectorsJson, WebflowItem, WebflowSector, WebflowSectorFieldData} from "./types";
import { allIndustryId, sectorCollectionId } from "./webflowIds";
import {SectorType} from "@businessnjgovnavigator/shared/sector";

const sectorDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/mappings`,
);

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
/* eslint-disable unicorn/no-process-exit */
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
  await (async (): Promise<void> => {
    await syncSectors();
    process.exit(1);
  })();
} else if (
  process.argv.some((i) => {
    return i.includes("--previewUnused");
  })
) {
  await (async (): Promise<void> => {
    console.info(await getUnUsedSectors());
    process.exit(1);
  })();
} else if (
  process.argv.some((i) => {
    return i.includes("--previewCreate");
  })
) {
  await (async (): Promise<void> => {
    console.info(await getNewSectors());
    process.exit(1);
  })();
} else if (
  process.argv.some((i) => {
    return i.includes("--previewUpdate");
  })
) {
  await (async (): Promise<void> => {
    console.info(await getUpdatedSectorNames());
    process.exit(1);
  })();
} else {
  console.log("Expected at least one argument! Use one of the following: ");
  console.log("--previewUnused = Preview Sectors to Delete");
  console.log("--previewCreate = Preview Sectors to Create");
  console.log("--previewUpdate = Preview Sectors to Update");
  console.log("--sync = Syncs sectors");
}

export { allIndustryId } from "./webflowIds";
