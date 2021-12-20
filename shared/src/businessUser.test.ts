import { BusinessUser, externalSyncUser } from "./businessUser";

describe("BusinessUser Tests", () => {
  it("does not add to newsletter if it exists but adds user testing if true", async () => {
    const userData = {
      email: "string",
      id: "id",
      externalStatus: { newsletter: { status: "SUCCESS", success: true } },
      userTesting: true,
      receiveNewsletter: true,
    } as BusinessUser;
    const newUserData = {
      ...userData,
      externalStatus: {
        newsletter: { status: "SUCCESS", success: true },
        userTesting: { status: "IN_PROGRESS" },
      },
    } as BusinessUser;
    expect(newUserData).toEqual(externalSyncUser(userData));
  });
});
