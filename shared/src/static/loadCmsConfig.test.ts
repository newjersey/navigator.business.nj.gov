import fs from "node:fs";
import path from "node:path";
import { loadCmsConfig, parseCmsConfig } from "./loadCmsConfig";

describe("parseCmsConfig", () => {
  it("returns the parsed config when it has a collections list", () => {
    const yamlText = "collections:\n  - name: config\n    label: Config\n";

    expect(parseCmsConfig(yamlText)).toEqual({
      collections: [{ name: "config", label: "Config" }],
    });
  });

  it("throws an Error when the YAML has no collections list", () => {
    expect(() => parseCmsConfig("backend:\n  name: github\n")).toThrow(
      new Error("CMS config has no collections list"),
    );
  });
});

describe("loadCmsConfig", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("parses the web CMS config file", () => {
    const readFileSync = jest
      .spyOn(fs, "readFileSync")
      .mockReturnValue("collections:\n  - name: config\n    label: Config\n");

    expect(loadCmsConfig(true)).toEqual({ collections: [{ name: "config", label: "Config" }] });
    expect(readFileSync).toHaveBeenCalledWith(
      path.join(process.cwd(), "..", "web", "public", "mgmt", "config.yml"),
      "utf8",
    );
  });
});
