import fs from "node:fs";
import path from "node:path";
import { Migrations } from "./migrations";

describe("migrations", () => {
  it("has every migration file in the migrations list", () => {
    const fileNames = fs.readdirSync(__dirname);
    const allMigrations = Migrations.map((it) => {
      return it.name;
    }); // all names in the form "migrate_vX_to_vY"
    const allMigrationsAsFinalVersion = allMigrations.map((it) => {
      return it.match(/to_v\d*/)?.[0].slice(3);
    });
    const allMigrationVersionsFromFiles = fileNames
      .filter((fileName) => {
        return !fileName.endsWith(".test.ts");
      })
      .filter((fileName) => {
        return !!/v\d*/.test(fileName);
      })
      .map((filename) => {
        return filename.match(/v\d*/)?.[0];
      })
      .filter((version) => {
        return !(version === "v0");
      }); // there is no migration to v0

    for (const fileVersion of allMigrationVersionsFromFiles) {
      expect(allMigrationsAsFinalVersion).toContain(fileVersion);
    }
  });

  it("has the correct file version in each migration file", () => {
    const fileNames = fs.readdirSync(__dirname);
    const allMigrationVersionsFromFiles = fileNames
      .filter((fileName) => {
        return !fileName.endsWith(".test.ts");
      })
      .filter((fileName) => {
        return !!/v\d*/.test(fileName);
      })
      .map((filename) => {
        return filename.match(/v\d*/)?.[0];
      })
      .filter((version) => {
        return !(version === "v0");
      }); // there is no migration to v0

    const allMigrationFiles = fileNames
      .filter((fileName) => {
        return !fileName.endsWith(".test.ts");
      })
      .filter((fileName) => {
        return !!/v\d*/.test(fileName);
      })
      .filter((version) => {
        return !(version === "v0");
      }); // there is no migration to v0

    for (const fileVersion of allMigrationVersionsFromFiles) {
      const version = fileVersion as string;
      const fileName =
        allMigrationFiles.find((x) => {
          return x?.startsWith(`${version}_`);
        }) ?? "";
      const fileContents = fs.readFileSync(path.join(__dirname, fileName)).toString();
      expect(fileContents).toContain(`version: ${version.slice(1)}`);
    }
  });
});
