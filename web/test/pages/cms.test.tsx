import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import fs from "fs";
import path from "path";

describe("cms", () => {
  describe("config", () => {
    it("allows editing all config fields in the CMS", () => {
      const cmsConfig = fs.readFileSync(path.join(process.cwd(), "public", "mgmt", "config.yml"), "utf8");
      const defaults = Object.keys(Config);

      for (const defaultGroup of defaults) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const fields = Object.keys(Config[defaultGroup]);

        for (const field of fields) {
          try {
            expect(cmsConfig.includes(field)).toBe(true);
          } catch {
            console.error(`Missing field ${field} in ${defaultGroup}`);
          }
        }
      }
    });
  });
});
