/* eslint-disable @typescript-eslint/no-explicit-any */

import { flattenObject } from "@/lib/utils/helpers";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import fs from "fs";
import path from "path";

describe("cms", () => {
  describe("config", () => {
    it("allows editing all config fields in the CMS", () => {
      const cmsConfig = fs.readFileSync(
        path.join(process.cwd(), "web", "public", "mgmt", "config.yml"),
        "utf8",
      );

      // We should try not to do this; if you do need to disable typescript please include a comment justifying why.
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
