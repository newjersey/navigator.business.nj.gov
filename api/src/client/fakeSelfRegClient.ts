import { SelfRegClient, SelfRegResponse } from "../domain/types";

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

export const FakeSelfRegClientFactory = (): SelfRegClient => {
  return {
    grant,
    resume,
  };
};
