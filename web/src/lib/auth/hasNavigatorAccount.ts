import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { BusinessUser } from "@businessnjgovnavigator/shared/businessUser";

// myNJ users (and abandoned myNJ signups) carry a myNJUserKey; ProfileNJ users
// never do, so a signed-in session also counts as having an account.
export const hasNavigatorAccount = (
  user: BusinessUser | undefined,
  isAuthenticated: IsAuthenticated,
): boolean => {
  return !!user?.myNJUserKey || isAuthenticated === IsAuthenticated.TRUE;
};
