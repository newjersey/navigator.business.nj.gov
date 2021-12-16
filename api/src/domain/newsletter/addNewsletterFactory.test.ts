import { UserData } from "@shared/userData";
import { generateUser, generateUserData } from "../../../test/factories";
import { AddNewsletter, NewsletterClient, UserDataClient } from "../types";
import { addNewsletterFactory } from "./addNewsletterFactory";

describe("addNewsletter", () => {
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
    };
    addNewsletter = addNewsletterFactory(stubUserDataClient, stubNewsletterClient);
    stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
      return Promise.resolve(userData);
    });
    stubNewsletterClient.add.mockResolvedValue({ success: true, status: "SUCCESS" });
  });

  it("updates the users database entry", async () => {
    const userData = generateUserData({ user: generateUser({ externalStatus: {} }) });
    const response = await addNewsletter(userData);
    expect(stubNewsletterClient.add).toHaveBeenCalledWith(userData.user.email);
    expect(response).toEqual({
      ...userData,
      user: {
        ...userData.user,
        externalStatus: { ...userData.user.externalStatus, newsletter: { success: true, status: "SUCCESS" } },
      },
    });
  });
});
