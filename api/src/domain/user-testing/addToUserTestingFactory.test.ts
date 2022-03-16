import { generateUser, generateUserData } from "../../../test/factories";
import { AddToUserTesting, UserTestingClient } from "../types";
import { addToUserTestingFactory } from "./addToUserTestingFactory";

describe("addToUserTesting", () => {
  let stubUserTestingClient: jest.Mocked<UserTestingClient>;
  let addToUserTesting: AddToUserTesting;

  beforeEach(async () => {
    jest.resetAllMocks();
    stubUserTestingClient = { add: jest.fn() };

    addToUserTesting = addToUserTestingFactory(stubUserTestingClient);
  });

  it("updates the users database entry", async () => {
    stubUserTestingClient.add.mockResolvedValue({ success: true, status: "SUCCESS" });

    const userData = generateUserData({ user: generateUser({ externalStatus: {} }) });
    const response = await addToUserTesting(userData);

    expect(stubUserTestingClient.add).toHaveBeenCalledWith(userData.user);
    expect(response).toEqual({
      ...userData,
      user: {
        ...userData.user,
        externalStatus: {
          ...userData.user.externalStatus,
          userTesting: { success: true, status: "SUCCESS" },
        },
      },
    });
  });
});
