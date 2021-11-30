import { generateExternalStatus, generateUser, generateUserData } from "../../../test/factories";
import { AddNewsletter, NewsletterClient, UserData, UserDataClient } from "../types";
import { addNewsletterFactory, shouldAddToNewsletter } from "./addNewsletterFactory";

describe("addNewsletter client", () => {
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

  it("the users database entry is updated", async () => {
    const userData = generateUserData({ user: generateUser({ id: "123", externalStatus: {} }) });
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

  describe("shouldAddToNewsletter", () => {
    it("does not add newsletter if receiveNewsletter is false", async () => {
      const userData = generateUserData({ user: generateUser({ id: "123", receiveNewsletter: false }) });
      expect(shouldAddToNewsletter(userData)).toEqual(false);
    });

    it("does not add newsletter if receiveNewsletter was successful", async () => {
      const userData = generateUserData({
        user: generateUser({ id: "123", externalStatus: generateExternalStatus({}, false) }),
      });
      expect(shouldAddToNewsletter(userData)).toEqual(false);
    });

    it("does not add newsletter if receiveNewsletter is true but unsuccessful", async () => {
      const userData = generateUserData({
        user: generateUser({
          id: "123",
          externalStatus: generateExternalStatus({}, true),
        }),
      });
      expect(shouldAddToNewsletter(userData)).toEqual(false);
    });
    it("does add newsletter if receiveNewsletter is true", async () => {
      const userData = generateUserData({
        user: generateUser({ id: "123", externalStatus: {} }),
      });
      expect(shouldAddToNewsletter(userData)).toEqual(true);
    });
  });
});
