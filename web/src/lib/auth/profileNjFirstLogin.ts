import { createEmptyUser } from "@businessnjgovnavigator/shared/businessUser";
import { PROFILE_NJ_PROVIDER_NAME } from "@businessnjgovnavigator/shared/signedInUser";
import { createEmptyUserData, type UserData } from "@businessnjgovnavigator/shared/userData";
import type { ActiveUser } from "@/lib/auth/AuthContext";

export interface CreateProfileNJUserDataInput {
  readonly guestUserData: UserData | undefined;
  readonly residentId: string;
  readonly email: string;
}

export interface ProfileNJFirstLoginDependencies {
  readonly getUserData: (id: string) => Promise<UserData>;
  readonly postUserData: (userData: UserData) => Promise<UserData>;
  readonly getGuestUserData: () => UserData | undefined;
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

export const ensureProfileNJUserRecord = async (
  activeUser: ActiveUser,
  dependencies: ProfileNJFirstLoginDependencies,
): Promise<void> => {
  if (activeUser.signInProvider !== PROFILE_NJ_PROVIDER_NAME) return;

  try {
    await dependencies.getUserData(activeUser.id);
  } catch (error) {
    if (error !== NOT_FOUND) throw error;
    await dependencies.postUserData(
      createProfileNJUserData({
        guestUserData: dependencies.getGuestUserData(),
        residentId: activeUser.id,
        email: activeUser.email,
      }),
    );
  }
};
