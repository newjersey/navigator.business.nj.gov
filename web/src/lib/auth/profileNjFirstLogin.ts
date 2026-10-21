import * as api from "@/lib/api-client/apiClient";
import { ActiveUser } from "@/lib/auth/AuthContext";
import { UserDataStorageFactory } from "@/lib/storage/UserDataStorage";
import { createEmptyUser } from "@businessnjgovnavigator/shared/businessUser";
import { PROFILE_NJ_PROVIDER_NAME } from "@businessnjgovnavigator/shared/signedInUser";
import { createEmptyUserData, UserData } from "@businessnjgovnavigator/shared/userData";

export interface CreateProfileNJUserDataInput {
  readonly guestUserData: UserData | undefined;
  readonly residentId: string;
  readonly email: string;
}

export interface ProfileNJFirstLoginDependencies {
  readonly getUserData: (id: string) => Promise<UserData>;
  readonly postUserData: (userData: UserData) => Promise<UserData>;
  readonly getGuestUserData: () => UserData | undefined;
  readonly removeGuestUserData: (guestUserId: string) => void;
}

const NOT_FOUND = 404;

// Guest data can come from an abandoned myNJ signup, so it may carry a
// myNJUserKey and the guest ID on the user and every business; none of that
// belongs on the ProfileNJ account.
export const createProfileNJUserData = (input: CreateProfileNJUserDataInput): UserData => {
  const email = input.email.trim().toLowerCase();
  const base =
    input.guestUserData ?? createEmptyUserData(createEmptyUser({ id: input.residentId, email }));
  const user = { ...base.user, id: input.residentId, email };
  delete user.myNJUserKey;

  const businesses = Object.fromEntries(
    Object.entries(base.businesses).map(([businessId, business]) => [
      businessId,
      { ...business, userId: input.residentId },
    ]),
  );

  return {
    ...base,
    user,
    businesses,
  };
};

export const createProfileNJFirstLoginDependencies = (): ProfileNJFirstLoginDependencies => {
  const userDataStorage = UserDataStorageFactory();
  return {
    getUserData: api.getUserData,
    postUserData: api.postUserData,
    getGuestUserData: () => userDataStorage.getCurrentUserData(),
    removeGuestUserData: (guestUserId) => userDataStorage.delete(guestUserId),
  };
};

const saveFirstRecordIfMissing = async (
  activeUser: ActiveUser,
  dependencies: ProfileNJFirstLoginDependencies,
): Promise<void> => {
  try {
    await dependencies.getUserData(activeUser.id);
  } catch (error) {
    if (error !== NOT_FOUND) throw error;
    const guestUserData = dependencies.getGuestUserData();
    await dependencies.postUserData(
      createProfileNJUserData({
        guestUserData,
        residentId: activeUser.id,
        email: activeUser.email,
      }),
    );
    // The guest entry is keyed on the guest ID, which sign-out never clears, so it
    // would otherwise leak this person's answers to the next guest on the device.
    if (guestUserData) dependencies.removeGuestUserData(guestUserData.user.id);
  }
};

// Amplify's "signedIn" Hub event (handled by onSignIn) and the /loading page both
// run after the same OAuth return; sharing one save keeps either from logging the
// user in before their record exists.
const savesInFlight = new Map<string, Promise<void>>();

export const ensureProfileNJUserRecord = async (
  activeUser: ActiveUser,
  dependencies: ProfileNJFirstLoginDependencies,
): Promise<void> => {
  if (activeUser.signInProvider !== PROFILE_NJ_PROVIDER_NAME) return;

  const inFlight = savesInFlight.get(activeUser.id);
  if (inFlight) return inFlight;

  const save = saveFirstRecordIfMissing(activeUser, dependencies).finally(() => {
    savesInFlight.delete(activeUser.id);
  });
  savesInFlight.set(activeUser.id, save);
  return save;
};
