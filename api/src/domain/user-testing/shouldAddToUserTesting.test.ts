import {
  generateExternalStatus,
  generateUser,
  generateUserData,
  generateUserTestingResponse,
} from "../../../test/factories";
import { shouldAddToUserTesting } from "./shouldAddToUserTesting";

describe("shouldAddToUserTesting", () => {
  it("does not add for user-testing if userTesting is false", async () => {
    const userData = generateUserData({ user: generateUser({ userTesting: false }) });
    expect(shouldAddToUserTesting(userData)).toEqual(false);
  });

  it("does not add for user-testing if userTesting add was already successful", async () => {
    const userData = generateUserData({
      user: generateUser({
        externalStatus: generateExternalStatus({
          userTesting: generateUserTestingResponse({ success: true }),
        }),
      }),
    });
    expect(shouldAddToUserTesting(userData)).toEqual(false);
  });

  it("does not add for user-testing if userTesting exists but is unsuccessful", async () => {
    const userData = generateUserData({
      user: generateUser({
        externalStatus: generateExternalStatus({
          userTesting: generateUserTestingResponse({ success: false }),
        }),
      }),
    });
    expect(shouldAddToUserTesting(userData)).toEqual(false);
  });

  it("does add for user-testing if no status exists yet", async () => {
    const userData = generateUserData({
      user: generateUser({ externalStatus: {} }),
    });
    expect(shouldAddToUserTesting(userData)).toEqual(true);
  });
});
