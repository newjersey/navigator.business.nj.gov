import { generateUser, generateUserDataPrime } from "@shared/test";
import { generateExternalStatus, generateNewsletterResponse } from "../../../test/factories";
import { shouldAddToNewsletter } from "./shouldAddToNewsletter";

describe("shouldAddToNewsletter", () => {
  it("does not add newsletter if receiveNewsletter is false", async () => {
    const userData = generateUserDataPrime({ user: generateUser({ receiveNewsletter: false }) });
    expect(shouldAddToNewsletter(userData)).toEqual(false);
  });

  it("does not add newsletter if receiveNewsletter was successful", async () => {
    const userData = generateUserDataPrime({
      user: generateUser({
        externalStatus: generateExternalStatus({
          newsletter: generateNewsletterResponse({ success: true }),
        }),
      }),
    });
    expect(shouldAddToNewsletter(userData)).toEqual(false);
  });

  it("does not add newsletter if receiveNewsletter is true but unsuccessful", async () => {
    const userData = generateUserDataPrime({
      user: generateUser({
        externalStatus: generateExternalStatus({
          newsletter: generateNewsletterResponse({ success: false }),
        }),
      }),
    });
    expect(shouldAddToNewsletter(userData)).toEqual(false);
  });

  it("does add newsletter if no status exists yet", async () => {
    const userData = generateUserDataPrime({
      user: generateUser({ externalStatus: {} }),
    });
    expect(shouldAddToNewsletter(userData)).toEqual(true);
  });
});
