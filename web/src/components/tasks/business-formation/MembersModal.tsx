import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { StateDropdown } from "@/components/tasks/business-formation/StateDropdown";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { createEmptyFormationMember, FormationMember, Municipality } from "@businessnjgovnavigator/shared";
import {
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
} from "@mui/material";
import React, { FormEvent, ReactElement, useContext, useEffect, useRef, useState } from "react";
interface Props {
  open: boolean;
  index?: number;
  handleClose: () => void;
  onSave: () => void;
}

export const MembersModal = (props: Props): ReactElement => {
  const { state, setFormationFormData } = useContext(FormationContext);
  const [useAgentAddress, setUseAgentAddress] = useState<boolean>(false);
  const [memberData, setMemberData] = useState<FormationMember>(createEmptyFormationMember());
  const formRef = useRef<HTMLFormElement>(null);

  type FieldStatus = {
    invalid: boolean | undefined;
  };

  const errorFields = [
    "memberName",
    "memberAddressLine1",
    "memberAddressCity",
    "memberAddressState",
    "memberAddressZipCode",
  ] as const;
  type ErrorFields = typeof errorFields[number];
  type MemberErrorMap = Record<ErrorFields, FieldStatus>;

  const createMemberErrorMap = (invalid?: boolean): MemberErrorMap =>
    errorFields.reduce(
      (prev: MemberErrorMap, curr: ErrorFields) => ({ ...prev, [curr]: { invalid } }),
      {} as MemberErrorMap
    );

  const [memberErrorMap, setMemberErrorMap] = useState<MemberErrorMap>(createMemberErrorMap());

  useEffect(() => {
    if (props.index !== undefined) {
      setMemberData({ ...state.formationFormData.members[props.index] });
      setMemberErrorMap(createMemberErrorMap(false));
    } else {
      setMemberData(createEmptyFormationMember());
      setUseAgentAddress(false);
      setMemberErrorMap(createMemberErrorMap());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open]);

  const checkBoxCheck = (checked: boolean) => {
    setUseAgentAddress(checked);
    if (checked) {
      setMemberData({
        ...memberData,
        name: `${state.formationFormData.contactFirstName.trim()} ${state.formationFormData.contactLastName.trim()}`,
        addressCity: (state.formationFormData.businessAddressCity as Municipality)?.displayName,
        addressLine1: state.formationFormData.businessAddressLine1,
        addressLine2: state.formationFormData.businessAddressLine2,
        addressState: state.formationFormData.businessAddressState,
        addressZipCode: state.formationFormData.businessAddressZipCode,
      });
      setMemberErrorMap(createMemberErrorMap(false));
    }
  };

  const onValidation = (fieldName: string, invalid: boolean) => {
    setMemberErrorMap({ ...memberErrorMap, [fieldName]: { invalid } });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const unValidated = Object.values(memberErrorMap).some((i) => i.invalid === undefined);
    if (unValidated) {
      setMemberErrorMap(
        errorFields.reduce(
          (prev: MemberErrorMap, curr: ErrorFields) => ({
            ...prev,
            [curr]: { invalid: prev[curr].invalid ?? true },
          }),
          { ...memberErrorMap } as MemberErrorMap
        )
      );
      return;
    }
    const failedValidation = Object.values(memberErrorMap).some((i) => i.invalid);

    if (failedValidation) {
      return;
    }
    if (props.index === undefined) {
      setFormationFormData({
        ...state.formationFormData,
        members: [...state.formationFormData.members, memberData],
      });
    } else {
      const members = [...state.formationFormData.members];
      members[props.index] = memberData;
      setFormationFormData({ ...state.formationFormData, members });
    }
    props.handleClose();
    props.onSave();
  };

  return (
    <Dialog
      open={props.open}
      maxWidth="sm"
      style={{ paddingBottom: "10px" }}
      fullWidth
      onClose={props.handleClose}
      data-testid={"members-modal"}
    >
      <DialogTitle sx={{ marginBottom: 2, padding: 3, paddingBottom: 0 }}>
        <Content>{state.displayContent.membersModal.contentMd}</Content>
        <IconButton
          aria-label="close"
          onClick={props.handleClose}
          sx={{
            position: "absolute",
            right: 10,
            top: 12,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Icon className="usa-icon--size-4">close</Icon>
        </IconButton>
      </DialogTitle>

      <DialogContent dividers={true}>
        <div className="form-input margin-bottom-1 margin-top-1">
          <FormGroup className="padding-left-105">
            <FormControlLabel
              label={state.displayContent.membersModal.sameNameCheckboxText}
              control={
                <Checkbox
                  checked={useAgentAddress}
                  onChange={(event) => checkBoxCheck(event.target.checked)}
                />
              }
            />
          </FormGroup>

          <form ref={formRef} data-testid="member" className="padding-top-1" onSubmit={onSubmit}>
            <Content>{Config.businessFormationDefaults.memberModalNameLabel}</Content>
            <GenericTextField
              value={memberData.name}
              placeholder={Config.businessFormationDefaults.memberModalNamePlaceholder}
              handleChange={(value: string) => setMemberData({ ...memberData, name: value })}
              error={memberErrorMap["memberName"].invalid}
              onValidation={onValidation}
              validationText={Config.businessFormationDefaults.nameErrorText}
              fieldName="memberName"
              required={true}
              autoComplete="name"
              disabled={useAgentAddress}
            />
            <Content>{Config.businessFormationDefaults.memberModalAddressLine1Label}</Content>
            <GenericTextField
              fieldName="memberAddressLine1"
              value={memberData.addressLine1}
              placeholder={Config.businessFormationDefaults.memberModalAddressLine1Placeholder}
              handleChange={(value: string) => setMemberData({ ...memberData, addressLine1: value })}
              error={memberErrorMap["memberAddressLine1"].invalid}
              onValidation={onValidation}
              autoComplete="address-line1"
              validationText={Config.businessFormationDefaults.addressErrorText}
              disabled={useAgentAddress}
              required={true}
            />
            <Content
              style={{ display: "inline" }}
              overrides={{
                p: ({ children }: { children: string[] }): ReactElement => (
                  <p style={{ display: "inline" }}>{children}</p>
                ),
              }}
            >
              {Config.businessFormationDefaults.memberModalAddressLine2Label}
            </Content>{" "}
            <div className="h6-styling">{Config.businessFormationDefaults.membersAddressLine2Optional}</div>
            <GenericTextField
              fieldName="memberAddressLine2"
              value={memberData.addressLine2}
              placeholder={Config.businessFormationDefaults.memberModalAddressLine2Placeholder}
              disabled={useAgentAddress}
              autoComplete="address-line2"
              handleChange={(value: string) => setMemberData({ ...memberData, addressLine2: value })}
            />
            <div className="grid-row grid-gap-2">
              <div className="grid-col-12 tablet:grid-col-6">
                <Content>{Config.businessFormationDefaults.memberModalCityLabel}</Content>
                <GenericTextField
                  fieldName="memberAddressCity"
                  autoComplete="address-level2"
                  value={memberData.addressCity}
                  disabled={useAgentAddress}
                  required={true}
                  placeholder={Config.businessFormationDefaults.memberModalCityPlaceholder}
                  handleChange={(value: string) => setMemberData({ ...memberData, addressCity: value })}
                  error={memberErrorMap["memberAddressCity"].invalid}
                  onValidation={onValidation}
                  validationText={Config.businessFormationDefaults.addressCityErrorText}
                />
              </div>
              <div className="grid-col-6 tablet:grid-col-3">
                <Content>{Config.businessFormationDefaults.memberModalStateLabel}</Content>
                <StateDropdown
                  fieldName="memberAddressState"
                  value={memberData.addressState}
                  placeholder={Config.businessFormationDefaults.memberModalStatePlaceholder}
                  validationText={Config.businessFormationDefaults.addressStateErrorText}
                  onSelect={(value: string | undefined) =>
                    setMemberData({ ...memberData, addressState: value ?? "" })
                  }
                  error={memberErrorMap["memberAddressState"].invalid}
                  autoComplete="address-level1"
                  disabled={useAgentAddress}
                  onValidation={onValidation}
                  required={true}
                />
              </div>
              <div className="grid-col-6 tablet:grid-col-3">
                <Content>{Config.businessFormationDefaults.memberModalZipCodeLabel}</Content>
                <GenericTextField
                  numericProps={{
                    maxLength: 5,
                  }}
                  disabled={useAgentAddress}
                  fieldName={"memberAddressZipCode"}
                  autoComplete="postal-code"
                  error={memberErrorMap["memberAddressZipCode"].invalid}
                  handleChange={(value: string) => setMemberData({ ...memberData, addressZipCode: value })}
                  value={memberData.addressZipCode}
                  validationText={Config.businessFormationDefaults.addressZipCodeErrorText}
                  onValidation={onValidation}
                  required={true}
                  placeholder={Config.businessFormationDefaults.memberModalZipCodePlaceholder}
                />
              </div>
            </div>
            <div className="margin-top-2">
              <div
                className="padding-3 bg-base-lightest flex flex-justify-end task-submit-button-background flex-wrap"
                style={{ gap: "1rem" }}
              >
                <Button
                  style="secondary"
                  onClick={props.handleClose}
                  dataTestid="memberCancel"
                  widthAutoOnMobile
                  noRightMargin
                >
                  {Config.businessFormationDefaults.membersModalBackButtonText}
                </Button>
                <Button
                  style="primary"
                  typeSubmit={true}
                  dataTestid="memberSubmit"
                  noRightMargin
                  widthAutoOnMobile
                >
                  <span className="text-no-wrap">
                    {Config.businessFormationDefaults.membersModalNextButtonText}
                  </span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
