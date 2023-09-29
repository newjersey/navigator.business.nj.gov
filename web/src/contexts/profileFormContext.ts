import { createFormContext } from "@/contexts/formContext";
import { ProfileFieldErrorMap } from "@/lib/types/types";

export const ProfileFormContext = createFormContext<ProfileFieldErrorMap>();
