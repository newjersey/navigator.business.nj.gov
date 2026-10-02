import { searchConfig } from "./searchConfig";

const cmsConfig = {
  collections: [
    {
      name: "config",
      label: "Config",
      files: [
        {
          name: "header",
          label: "Header File",
          fields: [
            {
              name: "header",
              label: "Header",
              fields: [
                { name: "title", label: "Title" },
                { name: "body", label: "Body" },
              ],
            },
          ],
        },
      ],
    },
  ],
};

describe("searchConfig", () => {
  it("groups term matches by CMS collection and file with their label path", () => {
    const config = { default: { header: { title: "Hello World", body: "nothing here" } } };

    expect(searchConfig(config, { term: "world" }, cmsConfig)).toEqual([
      {
        cmsCollectionName: "Config",
        cmsFileName: "Header File",
        matches: [
          { value: "Hello World", cmsLabelPath: ["Config", "Header File", "Header", "Title"] },
        ],
      },
    ]);
  });

  it("returns one match per regex capture, in traversal order", () => {
    const config = { default: { header: { title: "see {alpha}", body: "and {beta} {gamma}" } } };

    const result = searchConfig(config, { regex: /{(\w+)}/g }, cmsConfig);

    expect(result[0].matches).toEqual([
      { value: "alpha", cmsLabelPath: ["Config", "Header File", "Header", "Title"] },
      { value: "beta", cmsLabelPath: ["Config", "Header File", "Header", "Body"] },
      { value: "gamma", cmsLabelPath: ["Config", "Header File", "Header", "Body"] },
    ]);
  });

  it("throws an Error when no CMS file declares the top-level key", () => {
    const config = { default: { footer: { title: "Hello World" } } };

    expect(() => searchConfig(config, { term: "world" }, cmsConfig)).toThrow(
      new Error("DID NOT FIND CMS FILE FOR footer"),
    );
  });

  it("throws an Error when the CMS file is missing a nested field", () => {
    const config = { default: { header: { subtitle: "Hello World" } } };

    expect(() => searchConfig(config, { term: "world" }, cmsConfig)).toThrow(
      new Error(
        "NO MATCHING CMS PATH FOR header,subtitle (possibly missing in the CMS but exists in the JSON files)",
      ),
    );
  });
});
