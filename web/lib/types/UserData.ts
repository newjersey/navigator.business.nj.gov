import { BusinessUser } from "./BusinessUser";
import { BusinessForm } from "./form";

export interface UserData {
  user: BusinessUser;
  formData: BusinessForm;
  formProgress: FormProgress;
}

export type FormProgress = "UNSTARTED" | "IN-PROGRESS" | "COMPLETED";

export const createEmptyUserData = (user: BusinessUser): UserData => {
  return {
    user: user,
    formData: {
      user: {
        email: user.email,
      },
    },
    formProgress: "UNSTARTED",
  };
};
