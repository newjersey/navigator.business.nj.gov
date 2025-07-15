import { Content } from "@/components/Content";
import { UnitesStatesAddress } from "@/components/data-fields/address/UnitesStatesAddress";
import { BusinessName } from "@/components/data-fields/BusinessName";
import { GenericTextField } from "@/components/GenericTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ProfileField } from "@/components/profile/ProfileField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { AddressContext } from "@/contexts/addressContext";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
  pickData,
} from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getFlow, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import {
  CigaretteLicenseData,
  emptyCigaretteLicenseAddress,
  emptyCigaretteLicenseData,
} from "@businessnjgovnavigator/shared/cigaretteLicense";
import { FormationAddress } from "@businessnjgovnavigator/shared/formationData";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { emptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { Checkbox, FormControlLabel } from "@mui/material";
import { Dispatch, ReactElement, SetStateAction, useMemo, useState } from "react";

interface Props {
  setStepIndex: (idx: number) => void;
}

export const CigaretteLicenseStepTwo = ({ setStepIndex }: Props): ReactElement => {
  const { business, userData } = useUserData();
  const { Config } = useConfig();

  // Get legal structure and check for SP/GP
  const legalStructureId = business?.profileData?.legalStructureId;
  const legalStructure = useMemo(
    () => LookupLegalStructureById(legalStructureId),
    [legalStructureId],
  );
  const isSpOrGp =
    legalStructure.id === "sole-proprietorship" || legalStructure.id === "general-partnership";

  const [profileData, setProfileData] = useState<ProfileData>(emptyProfileData);

  const setProfile: Dispatch<SetStateAction<ProfileData>> = (action) => {
    setProfileData((prevProfileData) => {
      const profileData =
        typeof action === "function"
          ? (action as (prevState: ProfileData) => ProfileData)(prevProfileData)
          : action;

      // const relevantFields = pickData(profileData, ["businessName", "taxId", "taxPin"]);
      // setTaxClearanceCertificateData({
      //   ...taxClearanceCertificateData,
      //   ...relevantFields,
      // });

      return profileData;
    });
  };
  // Pre-fill values from profile
  const businessName = business?.profileData?.businessName || "";
  const responsibleOwnerName = business?.profileData?.responsibleOwnerName || "";
  const tradeName = business?.profileData?.tradeName || "";
  const taxId = business?.profileData?.taxId || "";

  // Form state
  const [formData, setFormData] = useState<CigaretteLicenseData>({
    ...emptyCigaretteLicenseData,
    businessName: businessName,
    responsibleOwnerName: responsibleOwnerName,
    tradeName: tradeName,
    taxId: taxId,
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
    contactName: business?.profileData?.responsibleOwnerName || "",
    contactPhoneNumber: "",
    contactEmail: userData?.user?.email || "",
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Address context setup
  const { state: formContextState } = useFormContextHelper(createDataFormErrorMap());
  const [addressData, setAddressData] = useState<FormationAddress>({
    addressLine1: business?.formationData?.formationFormData?.addressLine1 || "",
    addressLine2: business?.formationData?.formationFormData?.addressLine2 || "",
    addressCity: business?.formationData?.formationFormData?.addressMunicipality?.name || "",
    addressState: business?.formationData?.formationFormData?.addressState || undefined,
    addressZipCode: business?.formationData?.formationFormData?.addressZipCode || "",
    addressCountry: "US",
    businessLocationType: "US",
  });

  // Field handlers
  const handleFieldChange = (field: keyof CigaretteLicenseData, value: string | boolean): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (typeof value === "string" && errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
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

    // Clear error when user starts typing
    const errorKey = `${section}.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: false }));
    }
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
      setErrors((prev) => ({ ...prev, [fieldName]: true }));
      return false;
    }

    // Email validation
    if (fieldName === "contactEmail" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setErrors((prev) => ({ ...prev, [fieldName]: true }));
        return false;
      }
    }

    // Phone validation
    if (fieldName === "contactPhoneNumber" && value) {
      const phoneRegex = /^[\d\s()]+$/;
      if (!phoneRegex.test(value) || value.replaceAll(/\D/g, "").length < 10) {
        setErrors((prev) => ({ ...prev, [fieldName]: true }));
        return false;
      }
    }

    // Zip code validation
    if (fieldName.includes("addressZipCode") && value && value.length !== 5) {
      setErrors((prev) => ({ ...prev, [fieldName]: true }));
      return false;
    }

    setErrors((prev) => ({ ...prev, [fieldName]: false }));
    return true;
  };

  const handleNext = (): void => {
    setStepIndex(2);
  };

  const onValidation = (): void => {
    // This will be called by UnitesStatesAddress for validation
  };

  useMountEffectWhenDefined(() => {
    if (business) {
      setProfileData({
        ...profileData,
        businessName: business.profileData.businessName,
        taxId: business.profileData.taxId,
        encryptedTaxId: business.profileData.encryptedTaxId,
      });
    }
  }, business);

  return (
    <DataFormErrorMapContext.Provider value={formContextState}>
      <ProfileDataContext.Provider
          value={{
            state: {
              profileData: profileData,
              flow: getFlow(profileData),
            },
            setProfileData: setProfile,
            onBack: (): void => {},
          }}
        ></ProfileDataContext.Provider>
      <AddressContext.Provider
        value={{
          state: {
            formationAddressData: addressData,
          },
          setAddressData: setAddressData,
        }}
      >
        <>
          <h2 className="margin-bottom-2">Licensee Information</h2>
          <p className="margin-bottom-3">Tell us about the business applying for this license.</p>

          {/* Conditional fields for SP/GP vs others */}
          {isSpOrGp ? (
            <>
              {/* Responsible Owner Name (required) */}
              <WithErrorBar
                hasError={errors.responsibleOwnerName}
                type="ALWAYS"
                className="margin-bottom-3"
              >
                <strong>
                  <ModifiedContent>Responsible Owner Name</ModifiedContent>
                </strong>
                <Content>
                  Enter your full name exactly as it appears in the &quot;Responsible Owner
                  Name&quot; section of your tax confirmation email.
                </Content>
                <GenericTextField
                  fieldName="responsibleOwnerName"
                  value={formData.responsibleOwnerName || ""}
                  handleChange={(value: string) => handleFieldChange("responsibleOwnerName", value)}
                  onValidation={() =>
                    validateField("responsibleOwnerName", formData.responsibleOwnerName || "")
                  }
                  error={errors.responsibleOwnerName}
                  validationText="Responsible owner name is required"
                  required={true}
                  autoComplete="name"
                  inputWidth="full"
                />
              </WithErrorBar>

              {/* Trade Name (optional) */}
              <div className="margin-bottom-3">
                <strong>
                  <ModifiedContent>Trade Name</ModifiedContent>
                </strong>
                <span className="text-normal margin-left-1">(Optional)</span>
                <Content>
                  Enter this only if your business is known publicly by a name other than your legal
                  name.
                </Content>
                <GenericTextField
                  fieldName="tradeName"
                  value={formData.tradeName || ""}
                  handleChange={(value: string) => handleFieldChange("tradeName", value)}
                  autoComplete="organization"
                  inputWidth="full"
                />
              </div>
            </>
          ) : (
            <>
            <div>
              {/* Business Name (required) */}
                {/* <strong>
                  <Content>Business Name</Content>
                </strong> */}
                <Content>{Config.cigaretteLicenseStep2.businessNameText}</Content>
                <ProfileField
                  locked={false}
                  fieldName={"businessName"}
                  hideLine
                  fullWidth
                >
                  <BusinessName
                    inputWidth="full"
                    required={true}
                    validationText={Config.cigaretteLicenseStep2.businessNameErrorText}
                    preventRefreshWhenUnmounted
                  />
              </ProfileField>
              </div>
            </>
          )}

          {/* NJ Tax ID (masked, read-only) */}
          <div className="margin-bottom-3">
            <strong>
              <Content>`NJ Tax ID|tax-id`</Content>
            </strong>
            <div className="max-width-38rem">
              <GenericTextField
                fieldName="taxId"
                value={taxId ? `***-***-***${taxId.slice(-4)}` : formData.taxId || ""}
                readOnly={!!taxId}
                autoComplete="off"
                inputWidth="full"
                handleChange={(value: string) => handleFieldChange("taxId", value)}
              />
            </div>
          </div>

          {/* Business Address fields */}
          <div className="margin-bottom-3">
            <h3 className="margin-bottom-2">Business Address</h3>
            <UnitesStatesAddress
              onValidation={onValidation}
              dataFormErrorMap={formContextState}
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

            <WithErrorBar hasError={errors.contactName} type="ALWAYS" className="margin-bottom-2">
              <strong>
                <ModifiedContent>Contact Name</ModifiedContent>
              </strong>
              <GenericTextField
                fieldName="contactName"
                value={formData.contactName}
                handleChange={(value: string) => handleFieldChange("contactName", value)}
                onValidation={() => validateField("contactName", formData.contactName)}
                error={errors.contactName}
                validationText="Contact name is required"
                required={true}
                autoComplete="name"
                inputWidth="full"
              />
            </WithErrorBar>

            <WithErrorBar
              hasError={errors.contactPhoneNumber}
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
                error={errors.contactPhoneNumber}
                validationText="Valid phone number is required"
                required={true}
                autoComplete="tel"
                inputWidth="full"
              />
            </WithErrorBar>

            <WithErrorBar hasError={errors.contactEmail} type="ALWAYS" className="margin-bottom-2">
              <strong>
                <ModifiedContent>Email Address</ModifiedContent>
              </strong>
              <GenericTextField
                fieldName="contactEmail"
                value={formData.contactEmail}
                handleChange={(value: string) => handleFieldChange("contactEmail", value)}
                onValidation={() => validateField("contactEmail", formData.contactEmail)}
                error={errors.contactEmail}
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
    </DataFormErrorMapContext.Provider>
  );
};
