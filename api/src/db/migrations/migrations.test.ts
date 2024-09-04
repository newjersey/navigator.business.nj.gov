import { CURRENT_GENERATOR, Migrations } from "@db/migrations/migrations";
import { generateV0UserData } from "@db/migrations/v0_user_data";
import { CURRENT_VERSION } from "@shared/userData";
import fs from "node:fs";
import path from "node:path";

const areUserDatasEqual = (userData1: object, userData2: object): boolean => {
  // @ts-expect-error obj has any type but is a userData object
  function getDeepKeys(obj): string[] {
    let keys: string[] = [];
    for (const key in obj) {
      keys.push(key);
      if (typeof obj[key] === "object") {
        if (key === "businesses") {
          const subkeys = getDeepKeys(obj[key]);
          keys = [
            ...keys,
            ...subkeys.map(function (subkey) {
              const firstPeriodIndex = subkey.indexOf(".");
              const subkeyAfterBusinessId = subkey.slice(firstPeriodIndex + 1);
              if (subkeyAfterBusinessId.includes(".")) {
                const everythingAfterIdSingleString = "business-id-value.".concat(subkeyAfterBusinessId);
                return `${key}.${everythingAfterIdSingleString}`;
              } else {
                return `${key}.business-id-value`;
              }
            }),
          ];
        } else {
          const subkeys = getDeepKeys(obj[key]);
          keys = [
            ...keys,
            ...subkeys.map(function (subkey) {
              return `${key}.${subkey}`;
            }),
          ];
        }
      }
    }
    return keys;
  }

  const userData1DeepKeys = getDeepKeys(userData1).sort();
  const userData2DeepKeys = new Set(getDeepKeys(userData2).sort());

  for (const key of userData1DeepKeys) {
    if (!userData2DeepKeys.has(key)) {
      return false;
    }
  }
  return true;
};

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

    it("runs all migrations and gets user to current version", () => {
      let user: unknown = generateV0UserData({});
      for (const func of Migrations) {
        user = func(user);
      }
      // @ts-expect-error getting user version from unknown
      expect(user.version).toEqual(CURRENT_VERSION);
      expect(Migrations.length).toEqual(CURRENT_VERSION);
    });

    it("ensures that a user who has been fully migrated has the same fields as a newly generated user on the current version", () => {
      const currentUser = CURRENT_GENERATOR({});
      let migratedUser: unknown = generateV0UserData({});
      for (const func of Migrations) {
        migratedUser = func(migratedUser);
      }

      const userDataEqual = areUserDatasEqual(currentUser, migratedUser as object);

      // @ts-expect-error getting user version from unknown
      expect(migratedUser.version).toEqual(CURRENT_VERSION);
      expect(userDataEqual).toEqual(true);
    });
  });
});
