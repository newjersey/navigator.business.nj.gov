import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getFileNameByUrlSlug } from "./helpers";

describe("getFileNameByUrlSlug", () => {
  it("throws an Error when no file in the directory has the url slug", () => {
    const emptyDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "url-slug-"));

    try {
      expect(() => getFileNameByUrlSlug(emptyDirectory, "missing-slug")).toThrow(
        new Error("Task with urlSlug missing-slug not found"),
      );
    } finally {
      fs.rmSync(emptyDirectory, { recursive: true });
    }
  });
});
