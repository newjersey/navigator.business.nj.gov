import fs from "node:fs";
import path from "node:path";
import { cmsCollections } from "@businessnjgovnavigator/shared/lib/search/cmsCollections";
import yaml from "js-yaml";

interface CmsCollection {
  readonly label: string;
  readonly fields?: ReadonlyArray<{ readonly name: string }>;
}

interface CmsConfig {
  readonly collections: ReadonlyArray<CmsCollection>;
}

const isNavigationHeading = (collection: CmsCollection): boolean =>
  collection.fields?.length === 1 && collection.fields[0].name === "";

describe("CMS search groups", () => {
  const collectionsDirectory = path.join(__dirname, "..", "..", "decap-config", "collections");
  const cmsConfigCollections = fs
    .readdirSync(collectionsDirectory)
    .filter((fileName) => fileName.endsWith(".yml"))
    .flatMap((fileName) => {
      const filePath = path.join(collectionsDirectory, fileName);
      const config = yaml.load(fs.readFileSync(filePath, "utf8")) as CmsConfig;
      return config.collections;
    });

  it("lists the same collection labels as the CMS", () => {
    const cmsLabels = cmsConfigCollections
      .filter((collection) => !isNavigationHeading(collection))
      .map((collection) => collection.label)
      .sort();
    const searchLabels = cmsCollections.flatMap((group) => group.children).sort();

    expect(searchLabels).toEqual(cmsLabels);
  });

  it("uses the same section headings as the CMS", () => {
    const cmsHeadings = cmsConfigCollections
      .filter(isNavigationHeading)
      .map((collection) => collection.label)
      .sort();
    const searchHeadings = cmsCollections.map((group) => group.label).sort();

    expect(searchHeadings).toEqual(cmsHeadings);
  });
});
