import { ConfigType } from "@businessnjgovnavigator/shared/contexts";

interface LegalStructureDisplayNameProps {
  readonly config: ConfigType;
  readonly legalStructureId: string | undefined;
}

export const getLegalStructureDisplayName = ({
  config,
  legalStructureId,
}: LegalStructureDisplayNameProps): string => {
  if (!legalStructureId) return "";

  const labels: Readonly<Record<string, string>> =
    config.profileDefaults.fields.legalStructureId.default.optionLabels;

  return labels[legalStructureId] ?? "";
};
