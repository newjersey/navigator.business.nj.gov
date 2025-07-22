import { Content } from "@/components/Content";
import { UnitedStatesAddress } from "@/components/data-fields/address/UnitedStatesAddress";
import { TaxId } from "@/components/data-fields/tax-id/TaxId";
import { GenericTextField } from "@/components/GenericTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { getInitialTaxId } from "@/components/tasks/anytime-action/tax-clearance-certificate/helpers";
import { WithErrorBar } from "@/components/WithErrorBar";
import { AddressContext } from "@/contexts/addressContext";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import {
  CigaretteLicenseData,
  emptyCigaretteLicenseAddress,
  emptyCigaretteLicenseData,
} from "@businessnjgovnavigator/shared/cigaretteLicense";
import {
  emptyFormationAddressData,
  FormationAddress,
} from "@businessnjgovnavigator/shared/formationData";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { Checkbox, FormControlLabel } from "@mui/material";
import { ReactElement, SetStateAction, useContext, useMemo, useState } from "react";

interface Props {
  setStepIndex: (idx: number) => void;
}

export const LicenseeInfo = ({ setStepIndex }: Props): ReactElement => {
  const { business, userData } = useUserData();
  const { Config } = useConfig();

  const { doesRequiredFieldHaveErrorWithAdditionalData, doesFieldHaveErrorWithAdditionalData } =
    useAddressErrors();
  const { setIsValid: setIsValidAddressLine1 } = useFormContextFieldHelpers(
    "addressLine1",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidAddressLine2 } = useFormContextFieldHelpers(
    "addressLine2",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidCity } = useFormContextFieldHelpers(
    "addressCity",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidState } = useFormContextFieldHelpers(
    "addressState",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidZipCode } = useFormContextFieldHelpers(
    "addressZipCode",
    DataFormErrorMapContext,
  );

  // Get legal structure and check for SP/GP
  const legalStructureId = business?.profileData?.legalStructureId;
  const legalStructure = useMemo(
    () => LookupLegalStructureById(legalStructureId),
    [legalStructureId],
  );
  const isSpOrGp =
    legalStructure.id === "sole-proprietorship" || legalStructure.id === "general-partnership";

  // const taxId = business?.profileData?.taxId || "";

  // Form state
  const [formData, setFormData] = useState<CigaretteLicenseData>({
    ...emptyCigaretteLicenseData,
    businessName: business?.profileData?.businessName || "",
    responsibleOwnerName: business?.profileData?.responsibleOwnerName || "",
    tradeName: business?.profileData?.tradeName || "",
    taxId: business?.profileData?.taxId || "",
    encryptedTaxId: business?.profileData?.encryptedTaxId || "",
    businessAddress: {
      ...emptyCigaretteLicenseAddress,
      addressLine1: business?.formationData?.formationFormData?.addressLine1 || "",
      addressLine2: business?.formationData?.formationFormData?.addressLine2 || "",
      addressCity: business?.formationData?.formationFormData?.addressMunicipality?.name || "",
      addressState: business?.formationData?.formationFormData?.addressState || undefined,
      addressZipCode: business?.formationData?.formationFormData?.addressZipCode || "",
    },
    mailingAddressIsTheSame: false,
    mailingAddress: { ...emptyCigaretteLicenseAddress },
    contactName: "",
    contactPhoneNumber: "",
    contactEmail: userData?.user?.email || "",
  });

  const { fieldStates, reducer, runValidations } = useContext(DataFormErrorMapContext);

  const [formationAddressData, setAddressData] =
    useState<FormationAddress>(emptyFormationAddressData);

  // Create a custom setAddressData that also updates formData.businessAddress
  const setAddressDataWithSync = (action: SetStateAction<FormationAddress>): void => {
    setAddressData((prevAddress) => {
      const newAddress =
        typeof action === "function"
          ? (action as (prevState: FormationAddress) => FormationAddress)(prevAddress)
          : action;

      console.log("setAddressDataWithSync - newAddress:", newAddress);

      // Also update formData.businessAddress when formationAddressData changes
      setFormData((prevFormData) => ({
        ...prevFormData,
        businessAddress: {
          ...prevFormData.businessAddress,
          addressLine1: newAddress.addressLine1,
          addressLine2: newAddress.addressLine2,
          addressCity: newAddress.addressCity || "",
          addressState: newAddress.addressState,
          addressZipCode: newAddress.addressZipCode,
        },
      }));

      return newAddress;
    });
  };

  const handleFieldChange = (field: keyof CigaretteLicenseData, value: string | boolean): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (
    section: "businessAddress" | "mailingAddress",
    field: keyof typeof emptyCigaretteLicenseAddress,
    value: string | undefined,
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleMailingSameAsBusiness = (checked: boolean): void => {
    setFormData((prev) => ({
      ...prev,
      mailingAddressIsTheSame: checked,
      mailingAddress: checked ? { ...prev.businessAddress } : { ...emptyCigaretteLicenseAddress },
    }));
  };

  const validateField = (fieldName: string, value: string): boolean => {
    const requiredFields = isSpOrGp
      ? [
          "responsibleOwnerName",
          "businessAddress.addressLine1",
          "businessAddress.addressCity",
          "businessAddress.addressZipCode",
          "contactName",
          "contactPhoneNumber",
          "contactEmail",
        ]
      : [
          "businessName",
          "businessAddress.addressLine1",
          "businessAddress.addressCity",
          "businessAddress.addressZipCode",
          "contactName",
          "contactPhoneNumber",
          "contactEmail",
        ];

    if (requiredFields.includes(fieldName) && !value.trim()) {
      return false;
    }

    return true;
  };

  const handleNext = (): void => {
    setStepIndex(2);
  };

  const onValidation = (): void => {
    // Convert CigaretteLicenseAddress to the format expected by validation functions
    const businessAddressData = {
      addressLine1: formData.businessAddress.addressLine1,
      addressLine2: formData.businessAddress.addressLine2,
      addressCity: formData.businessAddress.addressCity,
      addressState: formData.businessAddress.addressState?.shortCode,
      addressZipCode: formData.businessAddress.addressZipCode,
    };

    setIsValidAddressLine1(
      !doesRequiredFieldHaveErrorWithAdditionalData("addressLine1", businessAddressData),
    );
    setIsValidAddressLine2(
      !doesFieldHaveErrorWithAdditionalData("addressLine2", businessAddressData),
    );
    setIsValidCity(
      !doesRequiredFieldHaveErrorWithAdditionalData("addressCity", businessAddressData),
    );
    setIsValidState(
      !doesRequiredFieldHaveErrorWithAdditionalData("addressState", businessAddressData),
    );
    setIsValidZipCode(
      !doesRequiredFieldHaveErrorWithAdditionalData("addressZipCode", businessAddressData),
    );
  };

  useMountEffectWhenDefined(() => {
    if (business) {
      // setProfileData({
      //   ...profileData,
      //   businessName: business.profileData.businessName,
      //   taxId: business.profileData.taxId,
      //   encryptedTaxId: business.profileData.encryptedTaxId,
      // });

      // Initialize formationAddressData with business address data
      setAddressDataWithSync({
        addressLine1: business.formationData?.formationFormData?.addressLine1 || "",
        addressLine2: business.formationData?.formationFormData?.addressLine2 || "",
        addressCity: business.formationData?.formationFormData?.addressMunicipality?.name || "",
        addressState: business.formationData?.formationFormData?.addressState || undefined,
        addressZipCode: business.formationData?.formationFormData?.addressZipCode || "",
        addressCountry: business.formationData?.formationFormData?.addressCountry || undefined,
        businessLocationType:
          business.formationData?.formationFormData?.businessLocationType || undefined,
      });
    }
  }, business);

  return (
    <>
      <AddressContext.Provider
        value={{
          state: {
            formationAddressData: formationAddressData,
          },
          setAddressData: setAddressDataWithSync,
        }}
      >
        <>
          <h2 className="margin-bottom-2">Licensee Information</h2>
          <p className="margin-bottom-3">Tell us about the business applying for this license.</p>

          {/* Conditional fields for SP/GP vs others */}
          {isSpOrGp ? (
            <>
              {/* Responsible Owner Name (required) */}
              <>
                <WithErrorBar
                  hasError={!!fieldStates.responsibleOwnerName?.invalid}
                  type="ALWAYS"
                  className="margin-bottom-3"
                >
                  <div>
                    <strong>
                      <Content>
                        {Config.cigaretteLicenseStep2.responsibleOwnerNameHeaderText}
                      </Content>
                    </strong>
                    <Content>{Config.cigaretteLicenseStep2.responsibleOwnerNameText}</Content>
                    <GenericTextField
                      fieldName="responsibleOwnerName"
                      value={formData.responsibleOwnerName || ""}
                      handleChange={(value: string) =>
                        handleFieldChange("responsibleOwnerName", value)
                      }
                      autoComplete="organization"
                      inputWidth="full"
                      required={true}
                      validationText={Config.cigaretteLicenseStep2.responsibleOwnerNameErrorText}
                      formContext={DataFormErrorMapContext}
                    />
                  </div>
                </WithErrorBar>
              </>

              {/* Trade Name (optional) */}
              <>
                <WithErrorBar
                  hasError={!!fieldStates.tradeName?.invalid}
                  type="ALWAYS"
                  className="margin-bottom-3"
                >
                  <div>
                    <strong>
                      <Content>{Config.cigaretteLicenseStep2.tradeNameHeaderText}</Content>
                    </strong>
                    <Content>{Config.cigaretteLicenseStep2.tradeNameText}</Content>
                    <GenericTextField
                      fieldName="tradeName"
                      value={formData.tradeName || ""}
                      handleChange={(value: string) => handleFieldChange("tradeName", value)}
                      autoComplete="organization"
                      inputWidth="full"
                      validationText={Config.cigaretteLicenseStep2.businessNameErrorText}
                      formContext={DataFormErrorMapContext}
                    />
                  </div>
                </WithErrorBar>
              </>
            </>
          ) : (
            <>
              <WithErrorBar
                hasError={!!fieldStates.businessName?.invalid}
                type="ALWAYS"
                className="margin-bottom-3"
              >
                <div>
                  {/* Business Name (required) */}
                  <strong>
                    <Content>{Config.cigaretteLicenseStep2.businessNameHeaderText}</Content>
                  </strong>
                  <Content>{Config.cigaretteLicenseStep2.businessNameText}</Content>
                  <GenericTextField
                    fieldName="businessName"
                    value={formData.businessName || ""}
                    handleChange={(value: string) => handleFieldChange("businessName", value)}
                    autoComplete="organization"
                    inputWidth="full"
                    required={true}
                    validationText={Config.cigaretteLicenseStep2.businessNameErrorText}
                    formContext={DataFormErrorMapContext}
                  />
                </div>
              </WithErrorBar>
            </>
          )}

          {/* NJ Tax ID (needs show/hide functionality) */}
          <div className="margin-bottom-3">
            <strong>
              <Content>`NJ Tax ID|tax-id`</Content>
            </strong>
            <div className="max-width-38rem">
              <TaxId
                dbBusinessTaxId={getInitialTaxId(business)}
                inputWidth="full"
                preventRefreshWhenUnmounted
                required
              />
            </div>
          </div>

          {/* Business Address fields */}
          <div className="margin-bottom-3">
            <h3 className="margin-bottom-2">Business Address</h3>
            <UnitedStatesAddress
              onValidation={onValidation}
              dataFormErrorMap={{
                fieldStates: fieldStates,
                reducer: reducer,
                runValidations: runValidations,
              }}
              isFullWidth
            />
          </div>

          {/* Mailing Address fields */}
          <div className="margin-bottom-3">
            <h3 className="margin-bottom-2">Mailing Address</h3>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.mailingAddressIsTheSame}
                  onChange={(e) => handleMailingSameAsBusiness(e.target.checked)}
                  color="primary"
                />
              }
              label="Same as business address"
              className="margin-bottom-2"
            />

            {!formData.mailingAddressIsTheSame && (
              <>
                <div className="margin-bottom-2">
                  <strong>
                    <ModifiedContent>Address Line 1</ModifiedContent>
                  </strong>
                  <GenericTextField
                    fieldName="mailingAddress.addressLine1"
                    value={formData.mailingAddress?.addressLine1 || ""}
                    handleChange={(value: string) =>
                      handleAddressChange("mailingAddress", "addressLine1", value)
                    }
                    autoComplete="address-line1"
                    inputWidth="full"
                  />
                </div>

                <div className="margin-bottom-2">
                  <strong>
                    <ModifiedContent>Address Line 2</ModifiedContent>
                  </strong>
                  <span className="text-normal margin-left-1">(Optional)</span>
                  <GenericTextField
                    fieldName="mailingAddress.addressLine2"
                    value={formData.mailingAddress?.addressLine2 || ""}
                    handleChange={(value: string) =>
                      handleAddressChange("mailingAddress", "addressLine2", value)
                    }
                    autoComplete="address-line2"
                    inputWidth="full"
                  />
                </div>

                <div className="grid-row grid-gap-1 margin-top-2">
                  <div className="grid-col-12 tablet:grid-col-6">
                    <div className="margin-bottom-2">
                      <strong>
                        <ModifiedContent>City</ModifiedContent>
                      </strong>
                      <GenericTextField
                        fieldName="mailingAddress.addressCity"
                        value={formData.mailingAddress?.addressCity || ""}
                        handleChange={(value: string) =>
                          handleAddressChange("mailingAddress", "addressCity", value)
                        }
                        autoComplete="address-level2"
                        inputWidth="full"
                      />
                    </div>
                  </div>
                  <div className="grid-col-12 tablet:grid-col-3 margin-top-2 tablet:margin-top-0">
                    <div className="margin-bottom-2">
                      <strong>
                        <ModifiedContent>State</ModifiedContent>
                      </strong>
                      <GenericTextField
                        fieldName="mailingAddress.addressState"
                        value={formData.mailingAddress?.addressState?.shortCode || ""}
                        handleChange={(value: string) =>
                          handleAddressChange("mailingAddress", "addressState", value)
                        }
                        autoComplete="address-level1"
                        inputWidth="full"
                      />
                    </div>
                  </div>
                  <div className="grid-col-12 tablet:grid-col-3 margin-top-2 tablet:margin-top-0">
                    <div className="margin-bottom-2">
                      <strong>
                        <ModifiedContent>ZIP Code</ModifiedContent>
                      </strong>
                      <GenericTextField
                        fieldName="mailingAddress.addressZipCode"
                        value={formData.mailingAddress?.addressZipCode || ""}
                        handleChange={(value: string) =>
                          handleAddressChange("mailingAddress", "addressZipCode", value)
                        }
                        autoComplete="postal-code"
                        numericProps={{ maxLength: 5 }}
                        inputWidth="full"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Contact Information fields */}
          <div className="margin-bottom-3">
            <h3 className="margin-bottom-2">Contact Information</h3>

            <WithErrorBar
              hasError={!!fieldStates.contactName?.invalid}
              type="ALWAYS"
              className="margin-bottom-2"
            >
              <strong>
                <ModifiedContent>Contact Name</ModifiedContent>
              </strong>
              <GenericTextField
                fieldName="contactName"
                value={formData.contactName}
                handleChange={(value: string) => handleFieldChange("contactName", value)}
                onValidation={() => validateField("contactName", formData.contactName)}
                error={fieldStates.contactName?.invalid}
                validationText="Contact name is required"
                required={true}
                autoComplete="name"
                inputWidth="full"
              />
            </WithErrorBar>

            <WithErrorBar
              hasError={!!fieldStates.contactPhoneNumber?.invalid}
              type="ALWAYS"
              className="margin-bottom-2"
            >
              <strong>
                <ModifiedContent>Phone Number</ModifiedContent>
              </strong>
              <GenericTextField
                fieldName="contactPhoneNumber"
                value={formData.contactPhoneNumber}
                handleChange={(value: string) => handleFieldChange("contactPhoneNumber", value)}
                onValidation={() =>
                  validateField("contactPhoneNumber", formData.contactPhoneNumber)
                }
                error={fieldStates.contactPhoneNumber?.invalid}
                validationText="Valid phone number is required"
                required={true}
                autoComplete="tel"
                inputWidth="full"
              />
            </WithErrorBar>

            <WithErrorBar
              hasError={!!fieldStates.contactEmail?.invalid}
              type="ALWAYS"
              className="margin-bottom-2"
            >
              <strong>
                <ModifiedContent>Email Address</ModifiedContent>
              </strong>
              <GenericTextField
                fieldName="contactEmail"
                value={formData.contactEmail}
                handleChange={(value: string) => handleFieldChange("contactEmail", value)}
                onValidation={() => validateField("contactEmail", formData.contactEmail)}
                error={fieldStates.contactEmail?.invalid}
                validationText="Valid email address is required"
                required={true}
                autoComplete="email"
                type="email"
                inputWidth="full"
              />
            </WithErrorBar>
          </div>

          {/* Issuing Agency static text */}
          <div className="margin-bottom-3">
            <span className="h6-styling">Issuing Agency: </span>
            <span>{Config.cigaretteLicenseShared.issuingAgencyText}</span>
          </div>

          {/* Navigation Buttons */}
          <div className="display-flex flex-justify">
            <SecondaryButton isColor="primary" onClick={() => setStepIndex(0)}>
              Back
            </SecondaryButton>
            <PrimaryButton isColor="primary" onClick={handleNext}>
              Next
            </PrimaryButton>
          </div>
        </>
      </AddressContext.Provider>
      {/* </DataFormErrorMapContext.Provider> */}
    </>
  );
};
