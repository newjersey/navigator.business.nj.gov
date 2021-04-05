import { BusinessUser, FormProgress } from "../../domain/types";
import { BusinessForm } from "./migrated-types";

export interface v0UserData {
  user: BusinessUser;
  formData: BusinessForm;
  formProgress: FormProgress;
}
