import { CURRENT_VERSION } from "@shared/userData";
import fs from "node:fs";
import path from "node:path";
import { Migrations } from "./migrations";

describe("migrations", () => {
  it("has CURRENT_VERSION number of migrations in the migrations list", () => {
    expect(Migrations.length).toEqual(CURRENT_VERSION);
  });

  it("last migration in the list is to CURRENT_VERSION", () => {
    const allMigrations = Migrations.map((it) => {
      return it.name;
    }); // all names in the form "migrate_vX_to_vY"

    const previousVersion = CURRENT_VERSION - 1;
    const expectedName = `migrate_v${previousVersion}_to_v${CURRENT_VERSION}`;
    expect(allMigrations[Migrations.length - 1]).toEqual(expectedName);
  });

  describe("migration files", () => {
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

    it("has every migration file in the migrations list", () => {
      const allMigrations = Migrations.map((it) => {
        return it.name;
      }); // all names in the form "migrate_vX_to_vY"
      const allMigrationsAsFinalVersion = allMigrations.map((it) => {
        return it.match(/to_v\d*/)?.[0].slice(3);
      });

      for (const fileVersion of allMigrationVersionsFromFiles) {
        expect(allMigrationsAsFinalVersion).toContain(fileVersion);
      }
    });

    it("has the correct file version in each migration file", () => {
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

    it("has CURRENT_VERSION as the version in last migration file", () => {
      const allVersionsAsNumbers = allMigrationVersionsFromFiles
        .filter((it) => it !== undefined)
        .map((it) => Number.parseInt((it as string).slice(1)));

      const sortedVersions = allVersionsAsNumbers.sort((a, b) => (a > b ? 1 : -1));
      const lastVersion = sortedVersions[sortedVersions.length - 1];
      expect(lastVersion).toEqual(CURRENT_VERSION);
      const fileName =
        allMigrationFiles.find((x) => {
          return x?.startsWith(`v${lastVersion}_`);
        }) ?? "";

      const fileContents = fs.readFileSync(path.join(__dirname, fileName)).toString();
      expect(fileContents).toContain(`version: ${CURRENT_VERSION}`);
    });
  });
});
