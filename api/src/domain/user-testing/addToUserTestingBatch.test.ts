import { UserData } from "@shared/userData";
import { generateUser, generateUserData } from "../../../test/factories";
import { AddToUserTesting, UserDataClient, UserDataQlClient, UserTestingClient } from "../types";
import { addToUserTestingBatch } from "./addToUserTestingBatch";
import { addToUserTestingFactory } from "./addToUserTestingFactory";

describe("addToUserTestingBatch", () => {
  let stubUserTestingClient: jest.Mocked<UserTestingClient>;
  let addToUserTesting: AddToUserTesting;
  let stubUserDataClient: jest.Mocked<UserDataClient>;
  let stubUserDataQlClient: jest.Mocked<UserDataQlClient>;

  beforeEach(async () => {
    jest.resetAllMocks();
    stubUserTestingClient = { add: jest.fn() };
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
    };
    stubUserDataQlClient = {
      getNeedNewsletterUsers: jest.fn(),
      getNeedToAddToUserTestingUsers: jest.fn(),
      search: jest.fn(),
    };
    addToUserTesting = addToUserTestingFactory(stubUserDataClient, stubUserTestingClient);
  });

  it("adds all users and returns success, failed, and total count when all succeed", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
      return Promise.resolve(userData);
    });
    stubUserTestingClient.add.mockResolvedValue({ success: true });

    stubUserDataQlClient.getNeedToAddToUserTestingUsers.mockResolvedValue([
      generateUserData({ user: generateUser({ externalStatus: {} }) }),
      generateUserData({ user: generateUser({ externalStatus: {} }) }),
    ]);

    const results = await addToUserTestingBatch(addToUserTesting, stubUserDataQlClient);
    expect(results).toEqual({ total: 2, success: 2, failed: 0 });
  });

  it("adds all users and returns success, failed, and total count whens some fail", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
      return Promise.resolve(userData);
    });
    stubUserTestingClient.add
      .mockResolvedValueOnce({ success: false })
      .mockResolvedValueOnce({ success: true });

    stubUserDataQlClient.getNeedToAddToUserTestingUsers.mockResolvedValue([
      generateUserData({ user: generateUser({ externalStatus: {} }) }),
      generateUserData({ user: generateUser({ externalStatus: {} }) }),
    ]);

    const results = await addToUserTestingBatch(addToUserTesting, stubUserDataQlClient);
    expect(results).toEqual({ total: 2, success: 1, failed: 1 });
  });

  it("does not stop execution if one fails", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
      return Promise.resolve(userData);
    });
    stubUserTestingClient.add.mockRejectedValueOnce({}).mockResolvedValueOnce({ success: true });

    stubUserDataQlClient.getNeedToAddToUserTestingUsers.mockResolvedValue([
      generateUserData({ user: generateUser({ externalStatus: {} }) }),
      generateUserData({ user: generateUser({ externalStatus: {} }) }),
    ]);

    const results = await addToUserTestingBatch(addToUserTesting, stubUserDataQlClient);
    expect(results).toEqual({ total: 2, success: 1, failed: 1 });
  });
});
