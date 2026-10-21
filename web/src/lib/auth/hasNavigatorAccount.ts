import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { BusinessUser } from "@businessnjgovnavigator/shared/businessUser";

// myNJ users (and abandoned myNJ signups) carry a myNJUserKey; ProfileNJ users
// never do, so with ProfileNJ login on, a signed-in session also counts. The
// flag keeps myNJ users without a key (records created during onboarding)
// behaving exactly as before.
export const hasNavigatorAccount = (
  user: BusinessUser | undefined,
  isAuthenticated: IsAuthenticated,
): boolean => {
  const profileNJLoginEnabled = process.env.FEATURE_PROFILE_NJ_LOGIN === "true";
  return !!user?.myNJUserKey || (profileNJLoginEnabled && isAuthenticated === IsAuthenticated.TRUE);
};
