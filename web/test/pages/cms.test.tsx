import fs from "node:fs";
import path from "node:path";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { flattenObject } from "@/lib/utils/helpers";

describe("cms", () => {
  describe("config", () => {
    it("allows editing all config fields in the CMS", () => {
      const cmsConfig = fs.readFileSync(
        path.join(process.cwd(), "web", "public", "mgmt", "config.yml"),
        "utf8",
      );

      const mergedConfig = getMergedConfig();

      for (const field of Object.keys(flattenObject(mergedConfig))) {
        try {
          expect(cmsConfig.includes(field)).toBe(true);
        } catch {
          console.error(`Missing field ${field}`);
        }
      }
    });
  });
});
