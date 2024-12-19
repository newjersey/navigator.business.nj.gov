import { Heading } from "@/components/njwds-extended/Heading";
import { FormationRadio } from "@/components/tasks/business-formation/business/FormationRadio";
import { FormationTextArea } from "@/components/tasks/business-formation/business/FormationTextArea";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { FormationFields, FormationTextField } from "@businessnjgovnavigator/shared";
import { ChangeEvent, ReactElement, ReactNode, useContext } from "react";

export const NonprofitProvisions = (): ReactElement<any> => {
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { Config } = useConfig();

  const hasBoardMembers = state.formationFormData.hasNonprofitBoardMembers;

  const isInForm = (fieldName: FormationFields): boolean => {
    return hasBoardMembers === true && state.formationFormData[fieldName] === "IN_FORM";
  };

  const getTextArea = (fieldName: FormationTextField): ReactNode => {
    return (
      <FormationTextArea
        fieldName={fieldName}
        label={Config.formation.nonprofitProvisions.description}
        maxChars={400}
      />
    );
  };

  const onChangeBoardMembers = (event: ChangeEvent<HTMLInputElement>): void => {
    const valueToSave = JSON.parse(event.target.value);
    setFormationFormData({
      ...state.formationFormData,
      hasNonprofitBoardMembers: valueToSave,
      nonprofitBoardMemberQualificationsSpecified: undefined,
      nonprofitBoardMemberQualificationsTerms: "",
      nonprofitBoardMemberRightsSpecified: undefined,
      nonprofitBoardMemberRightsTerms: "",
      nonprofitTrusteesMethodSpecified: undefined,
      nonprofitTrusteesMethodTerms: "",
      nonprofitAssetDistributionSpecified: undefined,
      nonprofitAssetDistributionTerms: "",
    });
    setFieldsInteracted(["hasNonprofitBoardMembers"]);
    setFieldsInteracted(
      [
        "nonprofitBoardMemberQualificationsSpecified",
        "nonprofitBoardMemberQualificationsTerms",
        "nonprofitBoardMemberRightsSpecified",
        "nonprofitBoardMemberRightsTerms",
        "nonprofitTrusteesMethodSpecified",
        "nonprofitTrusteesMethodTerms",
        "nonprofitAssetDistributionSpecified",
        "nonprofitAssetDistributionTerms",
      ],
      { setToUninteracted: true }
    );
  };

  const getFormBylawsRadio = (fieldName: FormationFields): ReactNode => {
    return (
      <FormationRadio
        fieldName={fieldName}
        values={["IN_BYLAWS", "IN_FORM"]}
        onChange={(e): void => {
          const value = e.target.value;
          setFormationFormData({
            ...state.formationFormData,
            [fieldName]: value,
          });
          setFieldsInteracted([fieldName]);
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title={(Config.formation.fields as any)[fieldName].body}
      />
    );
  };

  return (
    <>
      <div className="flex flex-column mobile-lg:flex-row mobile-lg:flex-align-center margin-bottom-2">
        <Heading level={2} styleVariant="h3" className="margin-0-override">
          {Config.formation.nonprofitProvisions.label}
        </Heading>
      </div>

      <FormationRadio
        fieldName="hasNonprofitBoardMembers"
        title={Config.formation.fields.hasNonprofitBoardMembers.body}
        values={["true", "false"]}
        onChange={onChangeBoardMembers}
      />

      {hasBoardMembers && getFormBylawsRadio("nonprofitBoardMemberQualificationsSpecified")}
      {isInForm("nonprofitBoardMemberQualificationsSpecified") &&
        getTextArea("nonprofitBoardMemberQualificationsTerms")}

      {hasBoardMembers && getFormBylawsRadio("nonprofitBoardMemberRightsSpecified")}
      {isInForm("nonprofitBoardMemberRightsSpecified") && getTextArea("nonprofitBoardMemberRightsTerms")}

      {hasBoardMembers && getFormBylawsRadio("nonprofitTrusteesMethodSpecified")}
      {isInForm("nonprofitTrusteesMethodSpecified") && getTextArea("nonprofitTrusteesMethodTerms")}

      {hasBoardMembers && getFormBylawsRadio("nonprofitAssetDistributionSpecified")}
      {isInForm("nonprofitAssetDistributionSpecified") && getTextArea("nonprofitAssetDistributionTerms")}
    </>
  );
};
