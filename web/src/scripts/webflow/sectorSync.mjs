/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-undef */
import fs from "fs";
import orderBy from "lodash";
import path from "path";
import { fileURLToPath } from "url";
import { createItem, deleteItem, getAllItems, modifyItem } from "./methods.mjs";

const sectorDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/mappings`
);
const getSectors = () => {
  return JSON.parse(fs.readFileSync(path.join(sectorDir, "sectors.json"), "utf8")).arrayOfSectors;
};

const sectorCollectionId = "61c21253f7640b5f5ce829a4";

const getCurrentSectors = async () => {
  return await getAllItems(sectorCollectionId);
};

const allIndustryId = "61c48e1b3257cc374781ee12";

const getOverlappingSectorsFunc = (currentSectors) => {
  return currentSectors.filter((item) => {
    return new Set(
      getSectors().map((_item) => {
        return _item.id;
      })
    ).has(item.slug);
  });
};

const getOverlappingSectors = async () => {
  return getOverlappingSectorsFunc(await getCurrentSectors());
};

const getUpdatedSectors = async () => {
  const sectorNames = new Set(
    getSectors().map((_item) => {
      return _item.name;
    })
  );
  return [...(await getOverlappingSectors())].filter((item) => {
    return !sectorNames.has(item.name);
  });
};

const getNewSectors = async () => {
  const current = await getCurrentSectors();
  const currentIdArray = new Set(
    current.map((sec) => {
      return sec.slug;
    })
  );
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
    return !(overLap.includes(item) || item._id == allIndustryId);
  });
};
const getUpdatedSectorNames = async () => {
  const sectors = getSectors();
  return [...(await getUpdatedSectors())].map((item) => {
    return {
      ...item,
      name: sectors.find((sector) => {
        return sector.id == item.slug;
      }).name,
    };
  });
};

const getSortedSectors = async () => {
  const current = await getCurrentSectors();
  const allIndustryItem = current.find((item) => {
    return item._id == allIndustryId;
  });
  return [allIndustryItem, ...orderBy(getOverlappingSectorsFunc(current), ["name"], "asc")].map((e, i) => {
    return {
      ...e,
      rank: i + 1,
    };
  });
};

const deleteSectors = async () => {
  return [...(await getUnUsedSectors())].map((item) => {
    return deleteItem(item, sectorCollectionId);
  });
};

const updateSectorNames = async () => {
  return [...(await getUpdatedSectorNames())].map((item) => {
    return modifyItem(item._id, sectorCollectionId, { name: item.name });
  });
};

const createNewSectors = async () => {
  return [...(await getNewSectors())].map((item) => {
    return createItem(item, sectorCollectionId, false);
  });
};

const reSortSectors = async () => {
  return [...(await getSortedSectors())].map((item) => {
    return modifyItem(item._id, sectorCollectionId, { rank: item.rank });
  });
};

const wait = (milliseconds = 10000) => {
  return new Promise((resolve) => {
    return setTimeout(resolve, milliseconds);
  });
};

const syncSectors = async () => {
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
  syncSectors,
  reSortSectors,
  createNewSectors,
  updateSectorNames,
  deleteSectors,
  getSectors,
  getSortedSectors,
  getUpdatedSectorNames,
  getUnUsedSectors,
  getNewSectors,
  getCurrentSectors,
  allIndustryId,
};
// eslint-disable-next-line no-empty
if (
  !process.argv.some((i) => {
    return i.includes("sectorSync");
  }) ||
  process.env.NODE_ENV == "test"
) {
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
    console.info(await getUnUsedSectors());
    process.exit(1);
  })();
} else if (
  process.argv.some((i) => {
    return i.includes("--previewCreate");
  })
) {
  await (async () => {
    console.info(await getNewSectors());
    process.exit(1);
  })();
} else if (
  process.argv.some((i) => {
    return i.includes("--previewUpdate");
  })
) {
  await (async () => {
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
