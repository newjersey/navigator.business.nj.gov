import { addNewsletterFactory } from "@domain/newsletter/addNewsletterFactory";
import { AddNewsletter, NewsletterClient } from "@domain/types";
import { generateUser, generateUserData } from "@shared/test";

describe("addNewsletter", () => {
  let stubNewsletterClient: jest.Mocked<NewsletterClient>;
  let addNewsletter: AddNewsletter;

  beforeEach(async () => {
    jest.resetAllMocks();
    stubNewsletterClient = { add: jest.fn() };
    addNewsletter = addNewsletterFactory(stubNewsletterClient);
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
        externalStatus: {
          ...userData.user.externalStatus,
          newsletter: { success: true, status: "SUCCESS" },
        },
      },
    });
  });
});
