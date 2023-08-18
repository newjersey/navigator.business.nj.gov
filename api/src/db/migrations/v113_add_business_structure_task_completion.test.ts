import {
  generateV112ProfileData,
  generateV112UserData
} from "./v112_add_last_visited_formation_page_to_formation_data";
import { migrate_v112_to_v113 } from "./v113_add_business_structure_task_completion";

describe("migrate_v112_to_v113", () => {
  it("sets business-structure task to complete if legal structure exists", () => {
    const v112UserData = generateV112UserData({
      profileData: generateV112ProfileData({ legalStructureId: "c-corporation" }),
      taskProgress: {}
    });

    expect(migrate_v112_to_v113(v112UserData).taskProgress).toEqual({ "business-structure": "COMPLETED" });
  });

  it("keeps prior task progress saved", () => {
    const v112UserData = generateV112UserData({
      profileData: generateV112ProfileData({ legalStructureId: "c-corporation" }),
      taskProgress: { "some-id": "IN_PROGRESS" }
    });

    expect(migrate_v112_to_v113(v112UserData).taskProgress).toEqual({
      "business-structure": "COMPLETED",
      "some-id": "IN_PROGRESS"
    });
  });

  it("sets business-structure task to unstarted if legal structure exists", () => {
    const v112UserData = generateV112UserData({
      profileData: generateV112ProfileData({ legalStructureId: undefined }),
      taskProgress: {}
    });

    expect(migrate_v112_to_v113(v112UserData).taskProgress).toEqual({ "business-structure": "NOT_STARTED" });
  });
});
