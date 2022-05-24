/* eslint-disable @typescript-eslint/no-explicit-any */

import { getMergedConfig } from "@/contexts/configContext";
import fs from "fs";
import path from "path";

describe("cms", () => {
  describe("config", () => {
    it("allows editing all config fields in the CMS", () => {
      const cmsConfig = fs.readFileSync(
        path.join(process.cwd(), "web", "public", "mgmt", "config.yml"),
        "utf8"
      );
      const mergedConfig = getMergedConfig();

      const flattenObject = (obj: any) => {
        const flattened: any = {};

        Object.keys(obj).forEach((key) => {
          const value = obj[key];

          if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            Object.assign(flattened, flattenObject(value));
          } else {
            flattened[key] = value;
          }
        });

        return flattened;
      };

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
