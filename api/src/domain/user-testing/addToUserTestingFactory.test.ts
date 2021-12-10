import { generateUser, generateUserData } from "../../../test/factories";
import { AddToUserTesting, UserDataClient, UserTestingClient } from "../types";
import { addToUserTestingFactory } from "./addToUserTestingFactory";
import { UserData } from "@shared/userData";

describe("addToUserTesting", () => {
  let stubUserTestingClient: jest.Mocked<UserTestingClient>;
  let addToUserTesting: AddToUserTesting;
  let stubUserDataClient: jest.Mocked<UserDataClient>;

  beforeEach(async () => {
    jest.resetAllMocks();
    stubUserTestingClient = { add: jest.fn() };
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
    };
    addToUserTesting = addToUserTestingFactory(stubUserDataClient, stubUserTestingClient);
  });

  it("updates the users database entry", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
      return Promise.resolve(userData);
    });
    stubUserTestingClient.add.mockResolvedValue({ success: true });

    const userData = generateUserData({ user: generateUser({ externalStatus: {} }) });
    const response = await addToUserTesting(userData);

    expect(stubUserTestingClient.add).toHaveBeenCalledWith(userData.user);
    expect(response).toEqual({
      ...userData,
      user: {
        ...userData.user,
        externalStatus: { ...userData.user.externalStatus, userTesting: { success: true } },
      },
    });
  });
});
