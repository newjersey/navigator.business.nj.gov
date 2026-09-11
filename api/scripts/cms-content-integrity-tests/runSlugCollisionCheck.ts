/**
 * Fails the build on CMS slug collisions without notifying anyone. `runCmsIntegrityTests.ts` runs
 * the same check with SNS alerting for pull requests into `content-repo`, where content editors
 * never see a red GitHub check.
 */

import {
  findSlugCollisions,
  logSlugCollisionReport,
} from "@businessnjgovnavigator/api/scripts/cms-content-integrity-tests/slugCollisions";

const runSlugCollisionCheck = (): void => {
  const report = findSlugCollisions();
  logSlugCollisionReport(report);

  if (report.collisions.length > 0) {
    console.error("Failed with Errors");
    process.exitCode = 1;
    return;
  }
  console.log("Succeeded No Errors");
};

runSlugCollisionCheck();
