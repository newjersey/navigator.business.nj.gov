import fs from "fs";
import { Migrations } from "./migrations";

describe("migrations", () => {
  it("has every migration file in the migrations list", () => {
    const fileNames = fs.readdirSync(__dirname);
    const allMigrations = Migrations.map((it) => it.name); // all names in the form "migrate_vX_to_vY"
    const allMigrationsAsFinalVersion = allMigrations.map((it) => it.match(/to_v[0-9]*/)?.[0].substr(3));
    const allMigrationVersionsFromFiles = fileNames
      .filter((fileName) => !fileName.endsWith(".test.ts"))
      .filter((fileName) => !!fileName.match(/v[0-9]*/))
      .map((filename) => filename.match(/v[0-9]*/)?.[0])
      .filter((version) => !(version === "v0")); // there is no migration to v0

    for (const fileVersion of allMigrationVersionsFromFiles) {
      expect(allMigrationsAsFinalVersion).toContain(fileVersion);
    }
  });
});
