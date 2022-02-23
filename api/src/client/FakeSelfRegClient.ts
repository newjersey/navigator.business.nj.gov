import { SelfRegClient, SelfRegResponse } from "../domain/types";

export const FakeSelfRegClientFactory = (): SelfRegClient => {
  const resume = (myNJUserKey: string): Promise<SelfRegResponse> => {
    return Promise.resolve({
      authRedirectURL: "/",
      myNJUserKey: myNJUserKey,
    });
  };

  const grant = (): Promise<SelfRegResponse> => {
    return Promise.resolve({
      authRedirectURL: "/",
      myNJUserKey: `some-myNJ-key-${Math.random()}`,
    });
  };

  return {
    grant,
    resume,
  };
};
