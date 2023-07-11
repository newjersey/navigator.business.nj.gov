import { generateUser, generateUserDataPrime } from "@shared/test";
import { AddToUserTesting, UserTestingClient } from "../types";
import { addToUserTestingFactory } from "./addToUserTestingFactory";

import { getCurrentBusinessForUser } from "@shared/businessHelpers";

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

    const userData = generateUserDataPrime({ user: generateUser({ externalStatus: {} }) });
    const response = await addToUserTesting(userData);

    expect(stubUserTestingClient.add).toHaveBeenCalledWith(
      userData.user,
      getCurrentBusinessForUser(userData).profileData
    );
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
