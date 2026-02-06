import { TaxId, Props as TaxIdProps } from "@/components/data-fields/tax-id/TaxId";
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
import userEvent from "@testing-library/user-event";

/*
 * NOTE: Tests in this file use fireEvent.change() instead of userEvent.type() for numeric inputs
 * due to a known React 19 + MUI + @testing-library/user-event bug where userEvent.type() only
 * enters the first character in controlled numeric inputs.
 *
 * See: https://github.com/testing-library/user-event/issues/1286
 * "JavaScript heap out of memory" - userEvent.type() causes infinite loops with React 19 + MUI number inputs
 *
 * Once this upstream issue is fixed, these tests should be converted back to userEvent.type()
 * for more realistic user interaction simulation.
 */

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

const renderComponent = (profileData: ProfileData, fieldProps?: Partial<TaxIdProps>): void => {
  const business = generateBusiness({ profileData });
  render(
    <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
      <WithStatefulProfileData initialData={profileData}>
        <TaxId
          dbBusinessTaxId={fieldProps ? fieldProps.dbBusinessTaxId : profileData.taxId}
          {...fieldProps}
        />
      </WithStatefulProfileData>
    </WithStatefulUserData>,
  );
};

describe("<TaxId />", () => {
  let profileData: ProfileData;
  const configForField = Config.profileDefaults.fields.taxId.default;

  beforeEach(() => {
    jest.resetAllMocks();
    setLargeScreen(true);
    profileData = generateProfileData({
      businessPersona: "STARTING",
    });
  });

  it("always renders as single field regardless of length", () => {
    renderComponent({
      ...profileData,
      taxId: "123456789",
    });
    expect(screen.queryByLabelText("Tax id location")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Tax id")).toBeInTheDocument();
  });

  it("renders single field with an existing 12 digit taxId", () => {
    renderComponent({
      ...profileData,
      taxId: "*******89123",
    });
    expect(screen.queryByLabelText("Tax id location")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Tax id")).toBeInTheDocument();
  });

  it("renders single field with no taxId", () => {
    renderComponent({
      ...profileData,
      taxId: "",
    });
    expect(screen.queryByLabelText("Tax id location")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Tax id")).toBeInTheDocument();
  });

  describe("Single TaxId Field", () => {
    it("pre-populates from profileData with 12 digits", () => {
      renderComponent({
        ...profileData,
        taxId: "*******89000",
      });
      expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual(
        "***-***-*89/000",
      );
    });

    it("pre-populates from profileData with 9 digits", () => {
      renderComponent({
        ...profileData,
        taxId: "123456789",
      });
      expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual("123-456-789");
    });

    it("formats 9 digits with hyphens", async () => {
      renderComponent({
        ...profileData,
        taxId: "",
      });
      const taxIdInput = await screen.findByLabelText("Tax id");
      fireEvent.change(taxIdInput, { target: { value: "123456789" } });

      await waitFor(() => {
        expect((taxIdInput as HTMLInputElement).value).toEqual("123-456-789");
      });
    });

    it("formats 12 digits with hyphens and slash", async () => {
      renderComponent({
        ...profileData,
        taxId: "",
      });
      const taxIdInput = await screen.findByLabelText("Tax id");
      fireEvent.change(taxIdInput, { target: { value: "123456789012" } });

      await waitFor(() => {
        expect((taxIdInput as HTMLInputElement).value).toEqual("123-456-789/012");
      });
    });

    it("successfully saves 12 digits to profileData", async () => {
      renderComponent({
        ...profileData,
        taxId: "",
      });
      const taxIdInput = await screen.findByLabelText("Tax id");
      // Using fireEvent due to React 19 + MUI bug (see file header comment)
      fireEvent.change(taxIdInput, { target: { value: "123456789000" } });
      fireEvent.blur(taxIdInput);

      await waitFor(() => {
        expect(currentProfileData().taxId).toEqual("123456789000");
      });
      expect(screen.queryByText(configForField.errorTextRequired)).not.toBeInTheDocument();
    });

    it("successfully saves 9 digits to profileData", async () => {
      renderComponent({
        ...profileData,
        taxId: "",
      });
      const taxIdInput = await screen.findByLabelText("Tax id");
      // Using fireEvent due to React 19 + MUI bug (see file header comment)
      fireEvent.change(taxIdInput, { target: { value: "123456789" } });
      fireEvent.blur(taxIdInput);

      await waitFor(() => {
        expect(currentProfileData().taxId).toEqual("123456789");
      });
      expect(screen.queryByText(configForField.errorTextRequired)).not.toBeInTheDocument();
    });

    it("validates 9 digits as valid", async () => {
      renderComponent(
        {
          ...profileData,
          taxId: "",
        },
        { required: true },
      );
      const taxIdInput = await screen.findByLabelText("Tax id");
      fireEvent.change(taxIdInput, { target: { value: "123456789" } });
      fireEvent.blur(taxIdInput);

      await waitFor(() => {
        expect(screen.queryByText(configForField.errorTextRequired)).not.toBeInTheDocument();
      });
    });

    it("validates 12 digits as valid", async () => {
      renderComponent(
        {
          ...profileData,
          taxId: "",
        },
        { required: true },
      );
      const taxIdInput = await screen.findByLabelText("Tax id");
      fireEvent.change(taxIdInput, { target: { value: "123456789012" } });
      fireEvent.blur(taxIdInput);

      await waitFor(() => {
        expect(screen.queryByText(configForField.errorTextRequired)).not.toBeInTheDocument();
      });
    });

    it("validates 10 digits as invalid", async () => {
      renderComponent(
        {
          ...profileData,
          taxId: "",
        },
        { required: true },
      );
      const taxIdInput = await screen.findByLabelText("Tax id");
      fireEvent.change(taxIdInput, { target: { value: "1234567890" } });
      fireEvent.blur(taxIdInput);

      await waitFor(() => {
        expect(screen.getByText(configForField.errorTextRequired)).toBeInTheDocument();
      });
    });

    it("validates 11 digits as invalid", async () => {
      renderComponent(
        {
          ...profileData,
          taxId: "",
        },
        { required: true },
      );
      const taxIdInput = await screen.findByLabelText("Tax id");
      fireEvent.change(taxIdInput, { target: { value: "12345678901" } });
      fireEvent.blur(taxIdInput);

      await waitFor(() => {
        expect(screen.getByText(configForField.errorTextRequired)).toBeInTheDocument();
      });
    });

    it("validates 5 digits as invalid", async () => {
      renderComponent(
        {
          ...profileData,
          taxId: "",
        },
        { required: true },
      );
      const taxIdInput = await screen.findByLabelText("Tax id");
      fireEvent.change(taxIdInput, { target: { value: "12345" } });
      fireEvent.blur(taxIdInput);

      await waitFor(() => {
        expect(screen.getByText(configForField.errorTextRequired)).toBeInTheDocument();
      });
    });

    it("renders the hide button initially if the tax id is empty", () => {
      renderComponent({
        ...profileData,
        taxId: "",
      });
      expect(screen.getByText(Config.taxId.hideButtonText)).toBeInTheDocument();
    });

    it("disables the field if the encrypted tax id is populated and tax id is masked", () => {
      renderComponent({
        ...profileData,
        taxId: "********9000",
        encryptedTaxId: "some-encrypted-value",
      });
      expect(screen.getByLabelText("Tax id")).toBeDisabled();
    });

    it("defaults to disabled if the database tax id is masked, even if profileData tax id is unmasked", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "123456789000",
          encryptedTaxId: "some-encrypted-value",
        },
        { dbBusinessTaxId: "********9000" },
      );
      expect(screen.getByLabelText("Tax id")).toBeDisabled();
    });

    it("decrypts the tax id if tax id is a masked value", async () => {
      mockApi.decryptValue.mockResolvedValue("123456789000");
      renderComponent({
        ...profileData,
        taxId: "********9000",
        encryptedTaxId: "some-encrypted-value",
      });
      const showButton = screen.getByText(Config.taxId.showButtonText);
      await userEvent.click(showButton);

      expect(mockApi.decryptValue).toHaveBeenCalledWith({ encryptedValue: "some-encrypted-value" });
      await waitFor(() => {
        expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual(
          "123-456-789/000",
        );
      });
    });

    it("doesn't decrypt if the tax id in current profile data is an unmasked value", async () => {
      mockApi.decryptValue.mockResolvedValue("123456789000");
      renderComponent({
        ...profileData,
        taxId: "*******89000",
        encryptedTaxId: "some-encrypted-value",
      });
      await userEvent.click(screen.getByText(Config.taxId.showButtonText));

      await waitFor(() => {
        expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual(
          "123-456-789/000",
        );
      });

      await userEvent.click(screen.getByText(Config.taxId.hideButtonText));

      await waitFor(() => {
        expect(currentProfileData().taxId).toEqual("123456789000");
      });

      await userEvent.click(screen.getByText(Config.taxId.showButtonText));
      expect(mockApi.decryptValue).toHaveBeenCalledTimes(1);
    });

    it("changes the tax id input type to text when show is clicked", async () => {
      mockApi.decryptValue.mockResolvedValue("123456789000");
      renderComponent({
        ...profileData,
        taxId: "********9000",
        encryptedTaxId: "some-encrypted-value",
      });
      expect((screen.getByLabelText("Tax id") as HTMLInputElement).type).toEqual("password");

      await userEvent.click(screen.getByText(Config.taxId.showButtonText));

      await waitFor(() => {
        expect((screen.getByLabelText("Tax id") as HTMLInputElement).type).toEqual("text");
      });
    });

    it("changes the tax id input to password when hide is clicked", async () => {
      renderComponent({
        ...profileData,
        taxId: "1233456789000",
      });
      expect((screen.getByLabelText("Tax id") as HTMLInputElement).type).toEqual("text");

      await userEvent.click(screen.getByText(Config.taxId.hideButtonText));

      await waitFor(() => {
        expect((screen.getByLabelText("Tax id") as HTMLInputElement).type).toEqual("password");
      });
    });

    it("toggles between hide and show text", async () => {
      mockApi.decryptValue.mockResolvedValue("123456789000");
      renderComponent({
        ...profileData,
        taxId: "********9000",
        encryptedTaxId: "some-encrypted-value",
      });
      expect(screen.queryByText(Config.taxId.hideButtonText)).not.toBeInTheDocument();

      await userEvent.click(screen.getByText(Config.taxId.showButtonText));

      await waitFor(() => {
        expect(screen.getByText(Config.taxId.hideButtonText)).toBeInTheDocument();
      });
      expect(screen.queryByText(Config.taxId.showButtonText)).not.toBeInTheDocument();
    });

    it("toggles between mobile hide and show text", async () => {
      mockApi.decryptValue.mockResolvedValue("123456789000");
      setLargeScreen(false);
      renderComponent({
        ...profileData,
        taxId: "********9000",
        encryptedTaxId: "some-encrypted-value",
      });
      expect(screen.queryByText(Config.taxId.hideButtonTextMobile)).not.toBeInTheDocument();

      await userEvent.click(screen.getByText(Config.taxId.showButtonTextMobile));

      await waitFor(() => {
        expect(screen.getByText(Config.taxId.hideButtonTextMobile)).toBeInTheDocument();
      });
      expect(screen.queryByText(Config.taxId.showButtonTextMobile)).not.toBeInTheDocument();
    });
  });
});
