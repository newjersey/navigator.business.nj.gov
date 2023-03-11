import { createFormContext } from "@/contexts/formContext";
import { ProfileFieldErrorMap } from "@/lib/types/types";

export const profileFormContext = createFormContext<ProfileFieldErrorMap>();
