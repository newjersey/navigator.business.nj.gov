import { User } from "netlify-identity-widget";
import { BusinessUser } from "../types/BusinessUser";

export const mapToUser = (user: User | null): BusinessUser | null => {
  if (!user) return null;
  return {
    name: user.user_metadata?.full_name,
    email: user.email,
    id: user.id,
  };
};
