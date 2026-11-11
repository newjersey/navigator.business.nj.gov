import assert from "node:assert/strict";
import test from "node:test";
import { syncDependencies } from "./sync-workspace-dependencies.ts";

test("synchronizes Navigator packages without changing static-site versions or workspace links", () => {
  const root = {
    dependencies: { next: "16.4.3", "@newjersey/njwds": "0.3.0" },
    devDependencies: { typescript: "5.9.3" },
  };
  const api = {
    name: "@businessnjgovnavigator/api",
    dependencies: { next: "16.4.1", "@businessnjgovnavigator/shared": "workspace:*" },
  };
  const site = {
    name: "@businessnjgovnavigator/static-site",
    dependencies: { next: "16.4.1", "@newjersey/njwds": "2.9.1" },
    devDependencies: { typescript: "7.0.2", playwright: "1.62.0" },
  };
  syncDependencies(root, [
    { path: "api", manifest: api },
    { path: "site", manifest: site },
  ]);
  assert.equal(api.dependencies.next, "16.4.3");
  assert.equal(api.dependencies["@businessnjgovnavigator/shared"], "workspace:*");
  assert.deepEqual(site.dependencies, { next: "16.4.1", "@newjersey/njwds": "2.9.1" });
  assert.deepEqual(site.devDependencies, { typescript: "7.0.2", playwright: "1.62.0" });
  assert.deepEqual(root.devDependencies, { typescript: "5.9.3" });
});
