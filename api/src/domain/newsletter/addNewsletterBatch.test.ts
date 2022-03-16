import { UserData } from "@shared/userData";
import { generateUser, generateUserData } from "../../../test/factories";
import { AddNewsletter, NewsletterClient, UserDataClient, UserDataQlClient } from "../types";
import { addNewsletterBatch } from "./addNewsletterBatch";
import { addNewsletterFactory } from "./addNewsletterFactory";

describe("addNewsletterBatch", () => {
  let stubNewsletterClient: jest.Mocked<NewsletterClient>;
  let addNewsletter: AddNewsletter;
  let stubUserDataClient: jest.Mocked<UserDataClient>;
  let stubUserDataQlClient: jest.Mocked<UserDataQlClient>;

  beforeEach(async () => {
    jest.resetAllMocks();
    stubNewsletterClient = { add: jest.fn() };
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
    addNewsletter = addNewsletterFactory(stubNewsletterClient);
  });

  it("adds all users and returns success, failed, and total count when all succeed", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
      return Promise.resolve(userData);
    });
    stubNewsletterClient.add.mockResolvedValue({ success: true, status: "SUCCESS" });

    stubUserDataQlClient.getNeedNewsletterUsers.mockResolvedValue([
      generateUserData({ user: generateUser({ externalStatus: {} }) }),
      generateUserData({ user: generateUser({ externalStatus: {} }) }),
    ]);

    const results = await addNewsletterBatch(addNewsletter, stubUserDataClient, stubUserDataQlClient);
    expect(results).toEqual({ total: 2, success: 2, failed: 0 });
  });

  it("adds all users and returns success, failed, and total count whens some fail", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
      return Promise.resolve(userData);
    });
    stubNewsletterClient.add
      .mockResolvedValueOnce({ success: false, status: "EMAIL_ERROR" })
      .mockResolvedValueOnce({ success: true, status: "SUCCESS" });

    stubUserDataQlClient.getNeedNewsletterUsers.mockResolvedValue([
      generateUserData({ user: generateUser({ externalStatus: {} }) }),
      generateUserData({ user: generateUser({ externalStatus: {} }) }),
    ]);

    const results = await addNewsletterBatch(addNewsletter, stubUserDataClient, stubUserDataQlClient);
    expect(results).toEqual({ total: 2, success: 1, failed: 1 });
  });

  it("does not stop execution if one fails", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
      return Promise.resolve(userData);
    });
    stubNewsletterClient.add
      .mockRejectedValueOnce({})
      .mockResolvedValueOnce({ success: true, status: "SUCCESS" });

    stubUserDataQlClient.getNeedNewsletterUsers.mockResolvedValue([
      generateUserData({ user: generateUser({ externalStatus: {} }) }),
      generateUserData({ user: generateUser({ externalStatus: {} }) }),
    ]);

    const results = await addNewsletterBatch(addNewsletter, stubUserDataClient, stubUserDataQlClient);
    expect(results).toEqual({ total: 2, success: 1, failed: 1 });
  });
});
