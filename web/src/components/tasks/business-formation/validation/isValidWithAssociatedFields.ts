import { FormationFields, FormationFormData} from "@businessnjgovnavigator/shared/formationData";

export const isValidWithAssociatedFields = ({
  value,
  formationFormData,
  associatedFields,
}: {
  value: any | undefined,
  formationFormData: FormationFormData;
  associatedFields: FormationFields[];
}): boolean => {
  const exists = !!value
  const hasError = !exists && associatedFields.some((it) => !!formationFormData[it]);
  return !hasError;
};

