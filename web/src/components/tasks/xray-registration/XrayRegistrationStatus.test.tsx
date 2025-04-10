import { XrayRegistrationStatus } from "@/components/tasks/xray-registration/XrayRegistrationStatus";
import { getMergedConfig } from "@/contexts/configContext";
import { generateEmptyFormationData } from "@/test/factories";
import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import {
  generateBusiness,
  generateFormationData,
  generateFormationFormData,
  generateFormationSubmitResponse,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import type { Business } from "@businessnjgovnavigator/shared/userData";
import { render, screen } from "@testing-library/react";

const Config = getMergedConfig();

describe("<XrayRegistrationStatus />", () => {
  const renderComponent = (business: Partial<Business>): void => {
    render(
      <WithStatefulUserData
        initialUserData={generateUserDataForBusiness(
          generateBusiness({
            ...business,
          })
        )}
      >
        <XrayRegistrationStatus onSubmit={() => {}} error={undefined} isLoading={false} />;
      </WithStatefulUserData>
    );
  };

  const getBusinessNameField = (): HTMLInputElement => {
    return screen.getByLabelText(Config.xrayRegistrationTask.businessNameLabel) as HTMLInputElement;
  };

  const getAddressLine1Field = (): HTMLInputElement => {
    return screen.getByLabelText(Config.xrayRegistrationTask.address1Label) as HTMLInputElement;
  };

  const getAddressLine2Field = (): HTMLInputElement => {
    return screen.getByLabelText(Config.xrayRegistrationTask.address2Label) as HTMLInputElement;
  };

  const getZipCodeField = (): HTMLInputElement => {
    return screen.getByTestId("addressZipCode") as HTMLInputElement;
  };

  const addressLine1 = "123 Random Street";
  const addressLine2 = "Apt 31";
  const addressZipCode = "12345";

  it("pre populates fields from xray registration facility details if available", () => {
    renderComponent({
      xrayRegistrationData: {
        facilityDetails: {
          businessName: "Brick and Mortar Store",
          addressLine1,
          addressLine2,
          addressZipCode,
        },
      },
    });
    expect(getBusinessNameField().value).toBe("Brick and Mortar Store");
    expect(getAddressLine1Field().value).toBe(addressLine1);
    expect(getAddressLine2Field().value).toBe(addressLine2);
    expect(getZipCodeField().value).toBe(addressZipCode);
  });

  describe("xray registration facility details are undefined", () => {
    it("pre populates the various fields from formationFormData when formation is succesful", () => {
      renderComponent({
        xrayRegistrationData: {
          facilityDetails: undefined,
        },
        formationData: generateFormationData({
          formationResponse: generateFormationSubmitResponse({ success: true }),
          formationFormData: generateFormationFormData({
            businessName: "Formed Business Name",
            addressLine1,
            addressLine2,
            addressZipCode,
          }),
        }),
      });
      expect(getBusinessNameField().value).toBe("Formed Business Name");
      expect(getAddressLine1Field().value).toBe(addressLine1);
      expect(getAddressLine2Field().value).toBe(addressLine2);
      expect(getZipCodeField().value).toBe(addressZipCode);
    });

    it("pre populates the businessName from profileData and addressData from formationFormData if formation isn't succesful", () => {
      renderComponent({
        xrayRegistrationData: {
          facilityDetails: undefined,
        },
        formationData: generateFormationData({
          formationResponse: generateFormationSubmitResponse({ success: false }),
          formationFormData: generateFormationFormData({
            businessName: "Unformed Business Name",
            addressLine1,
            addressLine2,
            addressZipCode,
          }),
        }),
        profileData: generateProfileData({
          businessName: "Business Name in Profile",
        }),
      });
      expect(getBusinessNameField().value).toBe("Business Name in Profile");
      expect(getAddressLine1Field().value).toBe(addressLine1);
      expect(getAddressLine2Field().value).toBe(addressLine2);
      expect(getZipCodeField().value).toBe(addressZipCode);
    });
  });

  it("renders fields with no values if there is no previous business name or address available", () => {
    renderComponent({
      xrayRegistrationData: {
        facilityDetails: undefined,
      },
      formationData: generateEmptyFormationData(),
      profileData: generateProfileData({
        businessName: "",
      }),
    });
    expect(getBusinessNameField().value).toBe("");
    expect(getAddressLine1Field().value).toBe("");
    expect(getAddressLine2Field().value).toBe("");
    expect(getZipCodeField().value).toBe("");
  });
});
