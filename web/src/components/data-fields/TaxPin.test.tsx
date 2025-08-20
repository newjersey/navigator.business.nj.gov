import { TaxPin, Props as TaxPinProps } from "@/components/data-fields/TaxPin";
import * as api from "@/lib/api-client/apiClient";
import { currentProfileData, WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import {
  generateBusiness,
  generateProfileData,
  generateUserDataForBusiness,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  decryptValue: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

const Config = getMergedConfig();

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

const setLargeScreen = (value: boolean): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => {
    return value;
  });
};

const renderComponent = (profileData: ProfileData, fieldProps?: Partial<TaxPinProps>): void => {
  const business = generateBusiness({ profileData });
  render(
    <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
      <WithStatefulProfileData initialData={profileData}>
        <TaxPin dbBusinessTaxPin={business.profileData.taxPin} {...fieldProps} />
      </WithStatefulProfileData>
      ,
    </WithStatefulUserData>,
  );
};

describe("<TaxPin />", () => {
  let profileData: ProfileData;
  const configForField = Config.profileDefaults.fields.taxPin.default;

  beforeEach(() => {
    jest.resetAllMocks();
    setLargeScreen(true);
    profileData = generateProfileData({
      businessPersona: "STARTING",
    });
  });

  it("pre-populates from profileData", () => {
    renderComponent({
      ...profileData,
      taxPin: "****",
    });
    expect(screen.getByLabelText("Tax pin") as HTMLInputElement).toHaveValue("****");
    expect((screen.getByLabelText("Tax pin") as HTMLInputElement).type).toEqual("password");
  });

  it("successfully saves to profileData", () => {
    renderComponent({
      ...profileData,
      taxPin: "",
    });
    const taxPinInput = screen.getByRole("textbox", { name: "Tax pin" });
    fireEvent.click(taxPinInput);
    fireEvent.change(taxPinInput, {
      target: { value: "1234" },
    });
    fireEvent.blur(taxPinInput);
    expect(currentProfileData().taxPin).toEqual("1234");
    expect(
      screen.queryByRole("paragraph", { name: configForField.errorTextRequired }),
    ).not.toBeInTheDocument();
  });

  it("fires validation for less than 4 characters", () => {
    renderComponent({
      ...profileData,
      taxPin: "",
    });
    const taxPinInput = screen.getByRole("textbox", { name: "Tax pin" });
    fireEvent.click(taxPinInput);
    fireEvent.change(taxPinInput, {
      target: { value: "123" },
    });
    fireEvent.blur(taxPinInput);
    expect(taxPinInput).toHaveAccessibleDescription(configForField.errorTextRequired);
  });

  it("renders the hide button initially if the tax pin is empty", () => {
    renderComponent({
      ...profileData,
      taxPin: "",
    });
    expect(screen.getByRole("button", { name: configForField.hideButtonText })).toBeInTheDocument();
  });

  it("disables the field if the encrypted tax id is populated and tax id is masked", () => {
    renderComponent({
      ...profileData,
      taxPin: "****",
      encryptedTaxPin: "some-encrypted-value",
    });
    expect(screen.getByLabelText("Tax pin")).toBeDisabled();
  });

  it("defaults to disabled if the database tax pin is masked, even if profileData tax pin is unmasked", () => {
    renderComponent(
      {
        ...profileData,
        taxPin: "1234",
        encryptedTaxPin: "some-encrypted-value",
      },
      { dbBusinessTaxPin: "****" },
    );
    expect(screen.getByLabelText("Tax pin")).toBeDisabled();
  });

  it("decrypts the tax pin if tax pin is a masked value", async () => {
    mockApi.decryptValue.mockResolvedValue("1234");
    renderComponent({
      ...profileData,
      taxPin: "****",
      encryptedTaxPin: "some-encrypted-value",
    });
    fireEvent.click(screen.getByRole("button", { name: configForField.showButtonText }));
    expect(mockApi.decryptValue).toHaveBeenCalledWith({ encryptedValue: "some-encrypted-value" });
    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: "Tax pin" }) as HTMLInputElement).toHaveValue(
        "1234",
      );
    });
  });

  it("doesn't decrypt if the tax pin in current profile data is an unmasked value", async () => {
    mockApi.decryptValue.mockResolvedValue("1234");
    renderComponent({
      ...profileData,
      taxPin: "****",
      encryptedTaxPin: "some-encrypted-value",
    });
    fireEvent.click(screen.getByRole("button", { name: configForField.showButtonText }));
    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: "Tax pin" }) as HTMLInputElement).toHaveValue(
        "1234",
      );
    });
    fireEvent.click(screen.getByRole("button", { name: configForField.hideButtonText }));
    await waitFor(() => {
      expect(currentProfileData().taxPin).toEqual("1234");
    });
    fireEvent.click(screen.getByRole("button", { name: configForField.showButtonText }));
    expect(mockApi.decryptValue).toHaveBeenCalledTimes(1);
  });

  it("changes the tax pin input type to text when show is clicked", async () => {
    mockApi.decryptValue.mockResolvedValue("1234");
    renderComponent({
      ...profileData,
      taxPin: "****",
      encryptedTaxPin: "some-encrypted-value",
    });
    expect((screen.getByLabelText("Tax pin") as HTMLInputElement).type).toEqual("password");
    fireEvent.click(screen.getByRole("button", { name: configForField.showButtonText }));
    await waitFor(() => {
      expect((screen.getByRole("textbox", { name: "Tax pin" }) as HTMLInputElement).type).toEqual(
        "text",
      );
    });
  });

  it("changes the tax pin input to password when hide is clicked", async () => {
    renderComponent({
      ...profileData,
      taxPin: "1234",
    });
    expect((screen.getByRole("textbox", { name: "Tax pin" }) as HTMLInputElement).type).toEqual(
      "text",
    );
    fireEvent.click(screen.getByRole("button", { name: configForField.hideButtonText }));
    expect((screen.getByLabelText("Tax pin") as HTMLInputElement).type).toEqual("password");
  });

  it("toggles between hide and show text", async () => {
    mockApi.decryptValue.mockResolvedValue("1234");
    renderComponent({
      ...profileData,
      taxPin: "****",
      encryptedTaxPin: "some-encrypted-value",
    });
    expect(
      screen.queryByRole("button", { name: configForField.hideButtonText }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: configForField.showButtonText }));
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: configForField.hideButtonText }),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: configForField.showButtonText }),
    ).not.toBeInTheDocument();
  });

  it("toggles between mobile hide and show text", async () => {
    mockApi.decryptValue.mockResolvedValue("1234");
    setLargeScreen(false);
    renderComponent({
      ...profileData,
      taxPin: "****",
      encryptedTaxPin: "some-encrypted-value",
    });
    expect(
      screen.queryByRole("button", { name: configForField.hideButtonTextMobile }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: configForField.showButtonTextMobile }));
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: configForField.hideButtonTextMobile }),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: configForField.showButtonTextMobile }),
    ).not.toBeInTheDocument();
  });
});
