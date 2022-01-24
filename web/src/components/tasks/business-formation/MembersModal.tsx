import { Content } from "@/components/Content";
import { GenericNumericField } from "@/components/GenericNumericField";
import { GenericTextField } from "@/components/GenericTextField";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { createEmptyFormationMember, FormationMember } from "@businessnjgovnavigator/shared";
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
import { StateDropdown } from "./StateDropdown";
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
    if (state.formationFormData.agentNumberOrManual === "MANUAL_ENTRY" && checked) {
      setMemberData({
        ...memberData,
        name: state.formationFormData.agentName,
        addressCity: state.formationFormData.agentOfficeAddressCity,
        addressLine1: state.formationFormData.agentOfficeAddressLine1,
        addressLine2: state.formationFormData.agentOfficeAddressLine2,
        addressState: state.formationFormData.agentOfficeAddressState,
        addressZipCode: state.formationFormData.agentOfficeAddressZipCode,
      });
      setMemberErrorMap(createMemberErrorMap(false));
    }
  };

  const onValidation = (invalid: boolean, fieldName: string) => {
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
        {" "}
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
        <div>
          <div className="form-input margin-bottom-1 margin-top-1">
            {state.formationFormData.agentNumberOrManual === "MANUAL_ENTRY" ? (
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
            ) : (
              <></>
            )}

            <form ref={formRef} data-testid="member" className="padding-top-1" onSubmit={onSubmit}>
              <Content>{state.displayContent.memberName.contentMd}</Content>
              <GenericTextField
                value={memberData.name}
                placeholder={state.displayContent.memberName.placeholder}
                handleChange={(value: string) => setMemberData({ ...memberData, name: value })}
                error={memberErrorMap["memberName"].invalid}
                onValidation={onValidation}
                validationText={BusinessFormationDefaults.nameErrorText}
                fieldName="memberName"
                required={true}
                autoComplete="name"
                disabled={useAgentAddress}
              />
              <Content>{state.displayContent.memberAddressLine1.contentMd}</Content>
              <GenericTextField
                fieldName="memberAddressLine1"
                value={memberData.addressLine1}
                placeholder={state.displayContent.memberAddressLine1.placeholder}
                handleChange={(value: string) => setMemberData({ ...memberData, addressLine1: value })}
                error={memberErrorMap["memberAddressLine1"].invalid}
                onValidation={onValidation}
                autoComplete="address-line1"
                validationText={BusinessFormationDefaults.addressErrorText}
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
                {state.displayContent.memberAddressLine2.contentMd}
              </Content>{" "}
              <h6 style={{ display: "inline", textTransform: "initial" }}>(Optional)</h6>
              <GenericTextField
                fieldName="memberAddressLine2"
                value={memberData.addressLine2}
                placeholder={state.displayContent.memberAddressLine2.placeholder}
                disabled={useAgentAddress}
                autoComplete="address-line2"
                handleChange={(value: string) => setMemberData({ ...memberData, addressLine2: value })}
              />
              <div className="grid-row grid-gap-1">
                <div className="desktop:grid-col">
                  <Content>{state.displayContent.memberAddressCity.contentMd}</Content>
                  <GenericTextField
                    fieldName="memberAddressCity"
                    autoComplete="address-level2"
                    value={memberData.addressCity}
                    disabled={useAgentAddress}
                    required={true}
                    placeholder={state.displayContent.memberAddressCity.placeholder}
                    handleChange={(value: string) => setMemberData({ ...memberData, addressCity: value })}
                    error={memberErrorMap["memberAddressCity"].invalid}
                    onValidation={onValidation}
                    validationText={BusinessFormationDefaults.addressCityErrorText}
                  />
                </div>
              </div>
              <div className="grid-row grid-gap-1">
                <div className="desktop:grid-col-6">
                  <Content>{state.displayContent.memberAddressState.contentMd}</Content>
                  <StateDropdown
                    fieldName="memberAddressState"
                    value={memberData.addressState}
                    placeholder={state.displayContent.memberAddressState.placeholder}
                    validationText={BusinessFormationDefaults.addressStateErrorText}
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
                <div className="desktop:grid-col-6">
                  <Content>{state.displayContent.memberAddressZipCode.contentMd}</Content>
                  <GenericNumericField
                    minLength={5}
                    maxLength={5}
                    disabled={useAgentAddress}
                    fieldName={"memberAddressZipCode"}
                    autoComplete="postal-code"
                    error={memberErrorMap["memberAddressZipCode"].invalid}
                    handleChange={(value: string) => setMemberData({ ...memberData, addressZipCode: value })}
                    value={memberData.addressZipCode}
                    validationText={BusinessFormationDefaults.addressZipCodeErrorText}
                    onValidation={onValidation}
                    required={true}
                    placeholder={state.displayContent.memberAddressZipCode.placeholder}
                  />
                </div>
              </div>
              <div className="margin-top-2">
                <div className="padding-205 bg-base-lightest flex flex-justify-end task-submit-button-background flex-wrap">
                  <Button style="secondary" onClick={props.handleClose} dataTestid={"memberCancel"}>
                    {BusinessFormationDefaults.membersModalBackButtonText}
                  </Button>
                  <div className="tablet:display-none margin-1"></div>
                  <Button style="primary" typeSubmit={true} dataTestid={"memberSubmit"}>
                    <span className="text-no-wrap">
                      {" "}
                      {BusinessFormationDefaults.membersModalNextButtonText}
                    </span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
