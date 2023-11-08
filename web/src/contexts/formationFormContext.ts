import { createFormContext } from "@/contexts/formContext";
import {FormationFieldErrorMap} from "@/lib/types/types";

export const FormationFormContext = createFormContext<FormationFieldErrorMap>();
