import type { ConfigType } from "@businessnjgovnavigator/shared/contexts";

type FormationFieldsContent = ConfigType["formation"]["fields"];
type FormationFieldTextKey = "label" | "error";

// Configured fields have different shapes; the index signature keeps fields that lack every
// named key here (e.g. checkbox-only fields) assignable.
interface FormationFieldText {
  readonly label?: string;
  readonly error?: string;
  readonly [key: string]: unknown;
}

interface LegalTypeOverridable<Override> {
  readonly overrides?: Readonly<Record<string, Override>>;
  readonly [key: string]: unknown;
}

// Field names reach here as form-data keys and API error fields, which are wider than the
// configured field names, and not every configured field has label or error text.
export const getFormationFieldText = (
  fields: FormationFieldsContent,
  fieldName: string,
  textKey: FormationFieldTextKey,
): string => {
  const textByFieldName: Readonly<Record<string, FormationFieldText>> = fields;
  return textByFieldName[fieldName][textKey] ?? "";
};

export const getLegalTypeOverride = <Override>(
  fieldContent: LegalTypeOverridable<Override>,
  legalType: string,
): Override | undefined => {
  const override = Object.entries(fieldContent.overrides ?? {}).find(
    ([overriddenLegalType]) => overriddenLegalType === legalType,
  );
  return override?.[1];
};
