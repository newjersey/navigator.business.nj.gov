import fs from "node:fs";
import { Migrations } from "./migrations";

describe("migrations", () => {
  it("has every migration file in the migrations list", () => {
    const fileNames = fs.readdirSync(__dirname);
    const allMigrations = Migrations.map((it) => it.name); // all names in the form "migrate_vX_to_vY"
    const allMigrationsAsFinalVersion = allMigrations.map((it) => it.match(/to_v\d*/)?.[0].slice(3));
    const allMigrationVersionsFromFiles = fileNames
      .filter((fileName) => !fileName.endsWith(".test.ts"))
      .filter((fileName) => !!/v\d*/.test(fileName))
      .map((filename) => filename.match(/v\d*/)?.[0])
      .filter((version) => !(version === "v0")); // there is no migration to v0

    for (const fileVersion of allMigrationVersionsFromFiles) {
      expect(allMigrationsAsFinalVersion).toContain(fileVersion);
    }
  });
});
