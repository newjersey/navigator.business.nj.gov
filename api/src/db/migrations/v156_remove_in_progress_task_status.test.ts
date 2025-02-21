import {
  generatev155Business,
  generatev155UserData,
} from "@db/migrations/v155_add_user_id_and_version_to_business";
import { migrate_v155_to_v156 } from "@db/migrations/v156_remove_in_progress_task_status";

describe("v156 migration updates taskProgress values, merging NOT_STARTED and IN_PROGRESS to single value of TO_DO", () => {
  it("should upgrade v155 business.taksProgess values", () => {
    const v155UserData = generatev155UserData({
      businesses: {
        "biz-1": generatev155Business({
          id: "biz-1",
          taskProgress: {
            ["task-1"]: "NOT_STARTED",
            ["task-2"]: "IN_PROGRESS",
            ["task-3"]: "COMPLETED",
          },
        }),
      },
      version: 155,
    });

    const migratedUserData = migrate_v155_to_v156(v155UserData);
    expect(migratedUserData.version).toBe(156);

    const taskProgresses = migratedUserData.businesses["biz-1"].taskProgress;

    expect(taskProgresses["task-1"]).toBeDefined();
    expect(taskProgresses["task-1"]).toBe("TO_DO");

    expect(taskProgresses["task-2"]).toBeDefined();
    expect(taskProgresses["task-2"]).toBe("TO_DO");

    expect(taskProgresses["task-3"]).toBeDefined();
    expect(taskProgresses["task-3"]).toBe("COMPLETED");
  });
});
