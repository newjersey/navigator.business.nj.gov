import { generateV0FormData, generateV0User, v0UserData } from "./v0_user_data";
import { migrate_v0_to_v1 } from "./v1_add_task_progress";

describe("migrate_v0_to_v1", () => {
  it("adds version and empty task progress object", () => {
    const user = generateV0User({});
    const formData = generateV0FormData({});
    const formProgress = "UNSTARTED";
    const v0: v0UserData = { user, formData, formProgress };
    expect(migrate_v0_to_v1(v0)).toEqual({
      user,
      formData,
      formProgress,
      taskProgress: {},
      version: 1
    });
  });
});
