/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import { XrayStatus } from "@/components/xray/XrayStatus";
import { generateEmptyFormationData } from "@/test/factories";
import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import {
  generateBusiness,
  generateFormationData,
  generateFormationFormData,
  generateFormationSubmitResponse,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import type { Business } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const Config = getMergedConfig();

describe("<XrayStatus />", () => {
  const renderComponent = (business: Partial<Business>): void => {
    render(
      <WithStatefulUserData
        initialUserData={generateUserDataForBusiness(
          generateBusiness({
            ...business,
          }),
        )}
      >
        <XrayStatus onSubmit={() => {}} error={undefined} isLoading={false} />;
      </WithStatefulUserData>,
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

  it("pre populates fields from xray registration facility details if available", async () => {
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
    await waitFor(() => {
      expect(getBusinessNameField().value).toBe("Brick and Mortar Store");
      expect(getAddressLine1Field().value).toBe(addressLine1);
      expect(getAddressLine2Field().value).toBe(addressLine2);
      expect(getZipCodeField().value).toBe(addressZipCode);
    });
  });

  describe("xray registration facility details are undefined", () => {
    it("pre populates the various fields from formationFormData when formation is succesful", async () => {
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
      await waitFor(() => {
        expect(getBusinessNameField().value).toBe("Formed Business Name");
        expect(getAddressLine1Field().value).toBe(addressLine1);
        expect(getAddressLine2Field().value).toBe(addressLine2);
        expect(getZipCodeField().value).toBe(addressZipCode);
      });
    });

    it("pre populates the businessName from profileData and addressData from formationFormData if formation isn't succesful", async () => {
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
      await waitFor(() => {
        expect(getBusinessNameField().value).toBe("Business Name in Profile");
        expect(getAddressLine1Field().value).toBe(addressLine1);
        expect(getAddressLine2Field().value).toBe(addressLine2);
        expect(getZipCodeField().value).toBe(addressZipCode);
      });
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

  it("shows validation errors when submitting form with empty required fields", async () => {
    renderComponent({
      xrayRegistrationData: {
        facilityDetails: undefined,
      },
      formationData: generateEmptyFormationData(),
      profileData: generateProfileData({
        businessName: "",
      }),
    });

    const submitButton = screen.getByTestId("check-status-submit");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Enter your business name.")).toBeInTheDocument();
    });

    expect(screen.getByText("Enter your facility's street name and number")).toBeInTheDocument();
    expect(screen.getByText("Enter your Zip code")).toBeInTheDocument();
    expect(screen.getByTestId("error-alert-FIELDS_REQUIRED")).toBeInTheDocument();
    expect(
      screen.getByText("Review the following fields for errors and missing information:"),
    ).toBeInTheDocument();
  });

  it("removes validation errors when filling out previously empty required fields", async () => {
    renderComponent({
      xrayRegistrationData: {
        facilityDetails: undefined,
      },
      formationData: generateEmptyFormationData(),
      profileData: generateProfileData({
        businessName: "",
      }),
    });

    const submitButton = screen.getByTestId("check-status-submit");
    const businessNameField = getBusinessNameField();
    const addressLine1Field = getAddressLine1Field();
    const zipCodeField = getZipCodeField();

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Enter your business name.")).toBeInTheDocument();
    });

    fireEvent.change(businessNameField, { target: { value: "Test Business" } });
    fireEvent.blur(businessNameField);

    await waitFor(() => {
      expect(screen.queryByText("Enter your business name.")).not.toBeInTheDocument();
    });

    fireEvent.change(addressLine1Field, { target: { value: "123 Test Street" } });
    fireEvent.blur(addressLine1Field);

    await waitFor(() => {
      expect(
        screen.queryByText("Enter your facility's street name and number"),
      ).not.toBeInTheDocument();
    });

    fireEvent.change(zipCodeField, { target: { value: "12345" } });
    fireEvent.blur(zipCodeField);

    await waitFor(() => {
      expect(screen.queryByText("Enter your Zip code")).not.toBeInTheDocument();
    });

    expect(screen.queryByTestId("error-alert-FIELDS_REQUIRED")).not.toBeInTheDocument();
  });
});
