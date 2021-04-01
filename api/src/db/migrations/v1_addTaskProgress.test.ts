import { v0UserData } from "./v0_userData";
import { generateFormData, generateUser } from "../../domain/factories";
import { migrate_v0_to_v1 } from "./v1_addTaskProgress";

describe("migrate_v0_to_v1", () => {
  it("adds version and empty task progress object", () => {
    const user = generateUser({});
    const formData = generateFormData({});
    const formProgress = "UNSTARTED";
    const v0: v0UserData = { user, formData, formProgress };
    expect(migrate_v0_to_v1(v0)).toEqual({
      user,
      formData,
      formProgress,
      taskProgress: {},
      version: 1,
    });
  });
});
