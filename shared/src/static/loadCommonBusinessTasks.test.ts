import { loadAnytimeActionTasksByFileName } from "./loadAnytimeActionTasks";
import { loadCommonBusinessTasks } from "./loadCommonBusinessTasks";

jest.mock("./loadAnytimeActionTasks");

describe("loadCommonBusinessTasks", () => {
  it("loads tasks for each markdown file in order", () => {
    // Arrange: predictable mock return values
    (loadAnytimeActionTasksByFileName as jest.Mock)
      .mockReturnValueOnce({ id: "task1" })
      .mockReturnValueOnce({ id: "task2" })
      .mockReturnValueOnce({ id: "task3" });

    // Act
    const result = loadCommonBusinessTasks();

    // Assert: calls in correct order
    expect(loadAnytimeActionTasksByFileName).toHaveBeenNthCalledWith(
      1,
      "registry-update-brc-amendment.md",
    );
    expect(loadAnytimeActionTasksByFileName).toHaveBeenNthCalledWith(
      2,
      "tax-clearance-certificate.md",
    );
    expect(loadAnytimeActionTasksByFileName).toHaveBeenNthCalledWith(3, "state-contracting.md");

    // Assert: returned array matches mocked outputs
    expect(result).toEqual([{ id: "task1" }, { id: "task2" }, { id: "task3" }]);
  });
});
