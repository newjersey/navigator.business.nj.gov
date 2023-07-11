import { generateUser, generateUserDataPrime } from "@shared/test";
import { UserDataPrime } from "@shared/userData";
import { AddToUserTesting, UserDataClient, UserTestingClient } from "../types";
import { addToUserTestingBatch } from "./addToUserTestingBatch";
import { addToUserTestingFactory } from "./addToUserTestingFactory";

describe("addToUserTestingBatch", () => {
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
      getNeedTaxIdEncryptionUsers: jest.fn(),
      getNeedNewsletterUsers: jest.fn(),
      getNeedToAddToUserTestingUsers: jest.fn(),
    };
    addToUserTesting = addToUserTestingFactory(stubUserTestingClient);
  });

  it("adds all users and returns success, failed, and total count when all succeed", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserDataPrime): Promise<UserDataPrime> => {
      return Promise.resolve(userData);
    });
    stubUserTestingClient.add.mockResolvedValue({ success: true, status: "SUCCESS" });

    stubUserDataClient.getNeedToAddToUserTestingUsers.mockResolvedValue([
      generateUserDataPrime({ user: generateUser({ externalStatus: {} }) }),
      generateUserDataPrime({ user: generateUser({ externalStatus: {} }) }),
    ]);

    const results = await addToUserTestingBatch(addToUserTesting, stubUserDataClient);
    expect(results).toEqual({ total: 2, success: 2, failed: 0 });
  });

  it("adds all users and returns success, failed, and total count whens some fail", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserDataPrime): Promise<UserDataPrime> => {
      return Promise.resolve(userData);
    });
    stubUserTestingClient.add
      .mockResolvedValueOnce({ success: false, status: "RESPONSE_ERROR" })
      .mockResolvedValueOnce({ success: true, status: "SUCCESS" });

    stubUserDataClient.getNeedToAddToUserTestingUsers.mockResolvedValue([
      generateUserDataPrime({ user: generateUser({ externalStatus: {} }) }),
      generateUserDataPrime({ user: generateUser({ externalStatus: {} }) }),
    ]);

    const results = await addToUserTestingBatch(addToUserTesting, stubUserDataClient);
    expect(results).toEqual({ total: 2, success: 1, failed: 1 });
  });

  it("does not stop execution if one fails", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserDataPrime): Promise<UserDataPrime> => {
      return Promise.resolve(userData);
    });
    stubUserTestingClient.add
      .mockRejectedValueOnce({})
      .mockResolvedValueOnce({ success: true, status: "SUCCESS" });

    stubUserDataClient.getNeedToAddToUserTestingUsers.mockResolvedValue([
      generateUserDataPrime({ user: generateUser({ externalStatus: {} }) }),
      generateUserDataPrime({ user: generateUser({ externalStatus: {} }) }),
    ]);

    const results = await addToUserTestingBatch(addToUserTesting, stubUserDataClient);
    expect(results).toEqual({ total: 2, success: 1, failed: 1 });
  });
});
