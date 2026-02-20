import {
  generatev188Business,
  generatev188UserData,
} from "@db/migrations/v188_zod_cleanup_address_status_boolean";
import { migrate_v188_to_v189 } from "@db/migrations/v189_update_env_task_id";

describe("migrate_v188_to_v189", () => {
  it("updates env-permitting task id to env-requirements in taskProgress", async () => {
    const v188UserData = generatev188UserData({
      businesses: {
        "123": generatev188Business({
          id: "123",
          taskProgress: {
            "env-permitting": "COMPLETED",
          },
        }),
      },
    });

    const v189UserData = await migrate_v188_to_v189(v188UserData);
    expect(v189UserData.businesses["123"].taskProgress).toEqual({
      "env-requirements": "COMPLETED",
    });
  });

  it("doesn't change anything in taskProgress if env-permitting task is not present", async () => {
    const v188UserData = generatev188UserData({
      businesses: {
        "123": generatev188Business({
          id: "123",
          taskProgress: {
            "some-other-task": "COMPLETED",
          },
        }),
      },
    });

    const v189UserData = await migrate_v188_to_v189(v188UserData);
    expect(v189UserData.businesses["123"].taskProgress).toEqual({
      "some-other-task": "COMPLETED",
    });
  });
});
