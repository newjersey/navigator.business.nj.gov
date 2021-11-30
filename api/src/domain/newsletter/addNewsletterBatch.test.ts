import { generateUser, generateUserData } from "../../../test/factories";
import { AddNewsletter, NewsletterClient, UserData, UserDataClient, UserDataQlClient } from "../types";
import { addNewsletterFactory } from "./addNewsletterFactory";
import { addNewsletterBatch } from "./addNewsletterBatch";

describe("addNewsletter client", () => {
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
      search: jest.fn(),
    };
    addNewsletter = addNewsletterFactory(stubUserDataClient, stubNewsletterClient);
    stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
      return Promise.resolve(userData);
    });
    stubNewsletterClient.add.mockResolvedValue({ success: true, status: "SUCCESS" });
  });

  it("tests the addNewsletterBatch feature", async () => {
    stubUserDataQlClient.getNeedNewsletterUsers.mockResolvedValue([
      generateUserData({ user: generateUser({ id: "123", externalStatus: {} }) }),
    ]);
    const results = await addNewsletterBatch(addNewsletter, stubUserDataQlClient);
    expect(results).toEqual({ attempts: 1, total: 1 });
  });
});
