import {
  BusinessSignerTypeMap,
  FormationIncorporator,
  FormationLegalType,
  FormationSigner
} from "@businessnjgovnavigator/shared/formationData";

export const needsSignerTypeFunc = (legalType: FormationLegalType): boolean => {
  return BusinessSignerTypeMap[legalType].length > 1;
};

export const createSignedEmptyFormationObject = <T extends FormationSigner | FormationIncorporator>(
  legalType: FormationLegalType,
  defaultFunc: () => T
): T => ({
  ...defaultFunc(),
  title: needsSignerTypeFunc(legalType) ? undefined : BusinessSignerTypeMap[legalType][0]
});
