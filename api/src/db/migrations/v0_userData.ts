import { BusinessForm } from "../../domain/form";
import { BusinessUser, FormProgress } from "../../domain/types";

export interface v0UserData {
  user: BusinessUser;
  formData: BusinessForm;
  formProgress: FormProgress;
}
