import { addNewsletterBatch } from "@domain/newsletter/addNewsletterBatch";
import { addNewsletterFactory } from "@domain/newsletter/addNewsletterFactory";
import { AddNewsletter, NewsletterClient, UserDataClient } from "@domain/types";
import { generateUser, generateUserData } from "@shared/test";
import { UserData } from "@shared/userData";

describe("addNewsletterBatch", () => {
  let stubNewsletterClient: jest.Mocked<NewsletterClient>;
  let addNewsletter: AddNewsletter;
  let stubUserDataClient: jest.Mocked<UserDataClient>;

  beforeEach(async () => {
    jest.resetAllMocks();
    stubNewsletterClient = { add: jest.fn() };
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
      getNeedNewsletterUsers: jest.fn(),
      getNeedToAddToUserTestingUsers: jest.fn(),
      getNeedTaxIdEncryptionUsers: jest.fn(),
      getUsersWithOutdatedVersion: jest.fn(),
      getUsersWithBusinesses: jest.fn(),
      findUserByBusinessName: jest.fn(),
    };
    addNewsletter = addNewsletterFactory(stubNewsletterClient);
  });

  it("adds all users and returns success, failed, and total count when all succeed", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
      return Promise.resolve(userData);
    });
    stubNewsletterClient.add.mockResolvedValue({ success: true, status: "SUCCESS" });

    stubUserDataClient.getNeedNewsletterUsers.mockResolvedValue([
      generateUserData({ user: generateUser({ externalStatus: {} }) }),
      generateUserData({ user: generateUser({ externalStatus: {} }) }),
    ]);

    const results = await addNewsletterBatch(addNewsletter, stubUserDataClient);
    expect(results).toEqual({ total: 2, success: 2, failed: 0 });
  });

  it("adds all users and returns success, failed, and total count whens some fail", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
      return Promise.resolve(userData);
    });
    stubNewsletterClient.add
      .mockResolvedValueOnce({ success: false, status: "EMAIL_ERROR" })
      .mockResolvedValueOnce({ success: true, status: "SUCCESS" });

    stubUserDataClient.getNeedNewsletterUsers.mockResolvedValue([
      generateUserData({ user: generateUser({ externalStatus: {} }) }),
      generateUserData({ user: generateUser({ externalStatus: {} }) }),
    ]);

    const results = await addNewsletterBatch(addNewsletter, stubUserDataClient);
    expect(results).toEqual({ total: 2, success: 1, failed: 1 });
  });

  it("does not stop execution if one fails", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
      return Promise.resolve(userData);
    });
    stubNewsletterClient.add
      .mockRejectedValueOnce({})
      .mockResolvedValueOnce({ success: true, status: "SUCCESS" });

    stubUserDataClient.getNeedNewsletterUsers.mockResolvedValue([
      generateUserData({ user: generateUser({ externalStatus: {} }) }),
      generateUserData({ user: generateUser({ externalStatus: {} }) }),
    ]);

    const results = await addNewsletterBatch(addNewsletter, stubUserDataClient);
    expect(results).toEqual({ total: 2, success: 1, failed: 1 });
  });
});
