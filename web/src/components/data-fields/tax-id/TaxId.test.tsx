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

  it("renders split field field with an existing 9 digit taxId", () => {
    renderComponent({
      ...profileData,
      taxId: "*****6789",
    });
    expect(screen.getByLabelText("Tax id location")).toBeInTheDocument();
  });

  it("renders single field with an existing 12 digit taxId", () => {
    renderComponent({
      ...profileData,
      taxId: "*******89123",
    });
    expect(screen.queryByLabelText("Tax id location")).not.toBeInTheDocument();
  });

  it("renders single field with no taxId", () => {
    renderComponent({
      ...profileData,
      taxId: "",
    });
    expect(screen.queryByLabelText("Tax id location")).not.toBeInTheDocument();
  });

  describe("Single TaxId Field", () => {
    it("pre-populates from profileData", () => {
      renderComponent({
        ...profileData,
        taxId: "*******89000",
      });
      expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual(
        "***-***-*89/000",
      );
    });

    it("successfully saves to profileData", () => {
      renderComponent({
        ...profileData,
        taxId: "",
      });
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456789000" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      expect(currentProfileData().taxId).toEqual("123456789000");
      expect(screen.queryByText(configForField.errorTextRequired)).not.toBeInTheDocument();
    });

    it("fires validation for less than 12 characters", () => {
      renderComponent({
        ...profileData,
        taxId: "",
      });
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "1234" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      expect(screen.getByText(configForField.errorTextRequired)).toBeInTheDocument();
    });

    it("retains initial field type", () => {
      renderComponent({
        ...profileData,
        taxId: "",
      });
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456789" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      expect(screen.queryByLabelText("Tax id location")).not.toBeInTheDocument();
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
      fireEvent.click(screen.getByText(Config.taxId.showButtonText));
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
      fireEvent.click(screen.getByText(Config.taxId.showButtonText));
      await waitFor(() => {
        expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual(
          "123-456-789/000",
        );
      });
      fireEvent.click(screen.getByText(Config.taxId.hideButtonText));
      await waitFor(() => {
        expect(currentProfileData().taxId).toEqual("123456789000");
      });
      fireEvent.click(screen.getByText(Config.taxId.showButtonText));
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
      fireEvent.click(screen.getByText(Config.taxId.showButtonText));
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
      fireEvent.click(screen.getByText(Config.taxId.hideButtonText));
      expect((screen.getByLabelText("Tax id") as HTMLInputElement).type).toEqual("password");
    });

    it("toggles between hide and show text", async () => {
      mockApi.decryptValue.mockResolvedValue("123456789000");
      renderComponent({
        ...profileData,
        taxId: "********9000",
        encryptedTaxId: "some-encrypted-value",
      });
      expect(screen.queryByText(Config.taxId.hideButtonText)).not.toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.taxId.showButtonText));
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
      fireEvent.click(screen.getByText(Config.taxId.showButtonTextMobile));
      await waitFor(() => {
        expect(screen.getByText(Config.taxId.hideButtonTextMobile)).toBeInTheDocument();
      });
      expect(screen.queryByText(Config.taxId.showButtonTextMobile)).not.toBeInTheDocument();
    });
  });

  describe("Split TaxId Field", () => {
    it("pre-populates from profileData", () => {
      renderComponent({
        ...profileData,
        taxId: "*******8912",
      });
      expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual("***-***-*89");
      expect((screen.getByLabelText("Tax id location") as HTMLInputElement).value).toEqual("12");
    });

    it("does not fire validation on blur of Tax id when at 9 digits", () => {
      renderComponent({
        ...profileData,
        taxId: "123456789",
      });
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456789" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      expect(screen.queryByText(configForField.errorTextRequired)).not.toBeInTheDocument();
    });

    it("fires validation on blur of Tax id", () => {
      renderComponent({
        ...profileData,
        taxId: "123456789",
      });
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      expect(screen.getByText(configForField.errorTextRequired)).toBeInTheDocument();
    });

    it("fires validation on blur of Tax id location", () => {
      renderComponent({
        ...profileData,
        taxId: "123456789",
      });
      fireEvent.click(screen.getByLabelText("Tax id location"));
      fireEvent.change(screen.getByLabelText("Tax id location"), {
        target: { value: "12" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id location"));
      expect(screen.getByText(configForField.errorTextRequired)).toBeInTheDocument();
    });

    it("fires validation on blur of empty Tax id location", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "123456789",
        },
        { required: true },
      );
      fireEvent.click(screen.getByLabelText("Tax id location"));
      fireEvent.blur(screen.getByLabelText("Tax id location"));
      expect(screen.getByText(configForField.errorTextRequired)).toBeInTheDocument();
    });

    it("shifts focus from Tax id to Tax id location fields", () => {
      renderComponent({
        ...profileData,
        taxId: "123456789",
      });
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456789" },
      });
      expect(screen.getByLabelText("Tax id location")).toHaveFocus();
      expect(screen.queryByText(configForField.errorTextRequired)).not.toBeInTheDocument();
    });

    it("does not shift focus back from Tax id location to Tax id field", () => {
      renderComponent({
        ...profileData,
        taxId: "123456789",
      });
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456789" },
      });
      expect(screen.getByLabelText("Tax id location")).toHaveFocus();
      fireEvent.change(screen.getByLabelText("Tax id location"), {
        target: { value: "123" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id location"));
      fireEvent.click(screen.getByLabelText("Tax id location"));
      fireEvent.change(screen.getByLabelText("Tax id location"), {
        target: { value: "" },
      });
      expect(screen.getByLabelText("Tax id location")).toHaveFocus();
      expect(screen.queryByText(configForField.errorTextRequired)).not.toBeInTheDocument();
    });

    it("updates profileData", () => {
      renderComponent({
        ...profileData,
        taxId: "123456789",
      });
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456789" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      fireEvent.click(screen.getByLabelText("Tax id location"));
      fireEvent.change(screen.getByLabelText("Tax id location"), {
        target: { value: "123" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id location"));
      expect(currentProfileData().taxId).toEqual("123456789123");
    });

    it("disables the field if the encrypted tax id is populated and tax id is masked", () => {
      renderComponent({
        ...profileData,
        taxId: "*****6789",
        encryptedTaxId: "some-encrypted-value",
      });
      expect(screen.getByLabelText("Tax id")).toBeDisabled();
      expect(screen.getByLabelText("Tax id location")).toBeDisabled();
    });

    it("defaults to disabled if the database tax id is masked, even if profileData tax id is unmasked", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "123456789",
          encryptedTaxId: "some-encrypted-value",
        },
        { dbBusinessTaxId: "*****6789" },
      );
      expect(screen.getByLabelText("Tax id")).toBeDisabled();
    });

    it("decrypts the tax id if tax id is a masked value", async () => {
      mockApi.decryptValue.mockResolvedValue("123456789");
      renderComponent({
        ...profileData,
        taxId: "*****6789",
        encryptedTaxId: "some-encrypted-value",
      });
      fireEvent.click(screen.getByText(Config.taxId.showButtonText));
      expect(mockApi.decryptValue).toHaveBeenCalledWith({ encryptedValue: "some-encrypted-value" });
      await waitFor(() => {
        expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual("123-456-789");
      });
    });

    it("doesn't decrypt if the tax id in current profile data is an unmasked value", async () => {
      mockApi.decryptValue.mockResolvedValue("123456789");
      renderComponent({
        ...profileData,
        taxId: "*****6789",
        encryptedTaxId: "some-encrypted-value",
      });
      fireEvent.click(screen.getByText(Config.taxId.showButtonText));
      await waitFor(() => {
        expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual("123-456-789");
      });
      fireEvent.click(screen.getByText(Config.taxId.hideButtonText));
      await waitFor(() => {
        expect(currentProfileData().taxId).toEqual("123456789");
      });
      fireEvent.click(screen.getByText(Config.taxId.showButtonText));
      expect(mockApi.decryptValue).toHaveBeenCalledTimes(1);
    });

    it("changes the tax id input type to text when show is clicked", async () => {
      mockApi.decryptValue.mockResolvedValue("123456789");
      renderComponent({
        ...profileData,
        taxId: "*****6789",
        encryptedTaxId: "some-encrypted-value",
      });
      expect((screen.getByLabelText("Tax id") as HTMLInputElement).type).toEqual("password");
      fireEvent.click(screen.getByText(Config.taxId.showButtonText));
      await waitFor(() => {
        expect((screen.getByLabelText("Tax id") as HTMLInputElement).type).toEqual("text");
      });
    });

    it("changes the tax id input to password when hide is clicked", async () => {
      renderComponent({
        ...profileData,
        taxId: "123456789",
      });
      expect((screen.getByLabelText("Tax id") as HTMLInputElement).type).toEqual("text");
      fireEvent.click(screen.getByText(Config.taxId.hideButtonText));
      expect((screen.getByLabelText("Tax id") as HTMLInputElement).type).toEqual("password");
    });

    it("toggles between hide and show text", async () => {
      mockApi.decryptValue.mockResolvedValue("123456789000");
      renderComponent({
        ...profileData,
        taxId: "*****6789",
        encryptedTaxId: "some-encrypted-value",
      });
      expect(screen.queryByText(Config.taxId.hideButtonText)).not.toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.taxId.showButtonText));
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
        taxId: "*****6789",
        encryptedTaxId: "some-encrypted-value",
      });
      expect(screen.queryByText(Config.taxId.hideButtonTextMobile)).not.toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.taxId.showButtonTextMobile));
      await waitFor(() => {
        expect(screen.getByText(Config.taxId.hideButtonTextMobile)).toBeInTheDocument();
      });
      expect(screen.queryByText(Config.taxId.showButtonTextMobile)).not.toBeInTheDocument();
    });
  });
});
