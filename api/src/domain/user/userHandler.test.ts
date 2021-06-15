import { UserDataClient, UserHandler } from "../types";
import { userHandlerFactory } from "./userHandlerFactory";
import { generateUserData } from "../factories";

describe("userHandler", () => {
  let userHandler: UserHandler;

  let stubUserDataClient: jest.Mocked<UserDataClient>;

  beforeEach(async () => {
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
    };
    userHandler = userHandlerFactory(stubUserDataClient);
  });

  it("gets from user data client", async () => {
    const userData = generateUserData({});
    stubUserDataClient.get.mockResolvedValue(userData);
    const result = await userHandler.get("some-id");
    expect(stubUserDataClient.get).toHaveBeenCalledWith("some-id");
    expect(result).toEqual(userData);
  });

  it("puts to the user data client", async () => {
    const sentUserData = generateUserData({});
    const returnedUserData = generateUserData({});
    stubUserDataClient.put.mockResolvedValue(returnedUserData);

    const result = await userHandler.put(sentUserData);
    expect(stubUserDataClient.put).toHaveBeenCalledWith(sentUserData);
    expect(result).toEqual(returnedUserData);
  });

  it("updates the user data with existing values and new partial", async () => {
    const gotUserData = generateUserData({ formProgress: "UNSTARTED" });
    const returnedUserData = generateUserData({});
    stubUserDataClient.get.mockResolvedValue(gotUserData);
    stubUserDataClient.put.mockResolvedValue(returnedUserData);

    const result = await userHandler.update("some-id", { formProgress: "COMPLETED" });
    expect(stubUserDataClient.get).toHaveBeenCalledWith("some-id");
    expect(stubUserDataClient.put).toHaveBeenCalledWith({ ...gotUserData, formProgress: "COMPLETED" });
    expect(result).toEqual(returnedUserData);
  });
});
