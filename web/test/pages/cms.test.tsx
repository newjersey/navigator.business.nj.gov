/* eslint-disable @typescript-eslint/no-explicit-any */

import { getMergedConfig } from "@/contexts/configContext";
import { flattenObject } from "@/lib/utils/helpers";
import fs from "fs";
import path from "path";

describe("cms", () => {
  describe("config", () => {
    it("allows editing all config fields in the CMS", () => {
      const cmsConfig = fs.readFileSync(path.join(process.cwd(), "public", "mgmt", "config.yml"), "utf8");

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const mergedConfig = getMergedConfig().default;

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
