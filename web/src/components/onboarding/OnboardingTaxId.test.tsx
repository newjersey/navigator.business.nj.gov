import { OnboardingTaxId } from "@/components/onboarding/OnboardingTaxId";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { createProfileFieldErrorMap, ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { generateProfileData } from "@/test/factories";
import { currentProfileData, WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { ProfileData } from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  decryptTaxId: jest.fn(),
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

type ErrorProps = {
  errorMap: ProfileFieldErrorMap;
  onValidation: (valFieldName: ProfileFields, invalid: boolean) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderComponent = (profileData: ProfileData, errorProps: ErrorProps, fieldProps?: any) => {
  render(
    <WithStatefulProfileData initialData={profileData}>
      <OnboardingTaxId
        fieldStates={errorProps.errorMap}
        onValidation={errorProps.onValidation}
        {...fieldProps}
      />
    </WithStatefulProfileData>
  );
};

describe("<OnboardingTaxId />", () => {
  let profileData: ProfileData;
  let errorProps: ErrorProps;
  const configForField = Config.profileDefaults.fields.taxId.default;

  beforeEach(() => {
    jest.resetAllMocks();
    setLargeScreen(true);
    errorProps = {
      errorMap: createProfileFieldErrorMap(),
      onValidation: jest.fn((valFieldName: ProfileFields, invalid: boolean) => {
        errorProps.errorMap[valFieldName] = { ...errorProps.errorMap[valFieldName], invalid };
      }),
    };
    profileData = generateProfileData({
      businessPersona: "STARTING",
    });
  });

  it("renders taxIdLocation field with an existing 9 digit taxId", () => {
    renderComponent(
      {
        ...profileData,
        taxId: "*****6789",
      },
      errorProps
    );
    expect(screen.getByLabelText("Tax id location")).toBeInTheDocument();
  });

  it("does not render taxIdLocation field with an existing 12 digit taxId", () => {
    renderComponent(
      {
        ...profileData,
        taxId: "*******89123",
      },
      errorProps
    );
    expect(screen.queryByLabelText("Tax id location")).not.toBeInTheDocument();
  });

  it("does not render taxIdLocation field with no taxId", () => {
    renderComponent(
      {
        ...profileData,
        taxId: "",
      },
      errorProps
    );
    expect(screen.queryByLabelText("Tax id location")).not.toBeInTheDocument();
  });

  describe("Single TaxId Field", () => {
    it("pre-populates from profileData", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "*******89000",
        },
        errorProps
      );
      expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual("***-***-*89/000");
    });

    it("successfully saves to profileData", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "",
        },
        errorProps
      );
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456789000" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      expect(currentProfileData().taxId).toEqual("123456789000");
      expect(screen.queryByText(configForField.errorTextRequired)).not.toBeInTheDocument();
    });

    it("fires validation for less than 12 characters", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "",
        },
        errorProps
      );
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "1234" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      expect(screen.getByText(configForField.errorTextRequired)).toBeInTheDocument();
    });

    it("retains initial field type", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "",
        },
        errorProps
      );
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456789" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      expect(screen.queryByLabelText("Tax id location")).not.toBeInTheDocument();
    });

    it("renders the hide button initially if the tax id is empty", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "",
        },
        errorProps
      );
      expect(screen.getByText(Config.tax.hideButtonText)).toBeInTheDocument();
    });

    it("disables the field if the encrypted tax id is populated", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "********9000",
          encryptedTaxId: "some-encrypted-value",
        },
        errorProps
      );
      expect(screen.getByLabelText("Tax id")).toBeDisabled();
    });

    it("decrypts the tax id if needed when show is clicked and button toggles text to hide", async () => {
      mockApi.decryptTaxId.mockResolvedValue("123456789000");
      renderComponent(
        {
          ...profileData,
          taxId: "********9000",
          encryptedTaxId: "some-encrypted-value",
        },
        errorProps
      );
      expect(screen.queryByText(Config.tax.hideButtonText)).not.toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.tax.showButtonText));
      expect(mockApi.decryptTaxId).toHaveBeenCalled();
      await waitFor(() => {
        expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual("123-456-789/000");
      });
      expect(screen.getByText(Config.tax.hideButtonText)).toBeInTheDocument();
    });

    it("doesn't decrypt the tax id if tax id is already decrypted", async () => {
      mockApi.decryptTaxId.mockResolvedValue("123456789000");
      renderComponent(
        {
          ...profileData,
          taxId: "*******89000",
          encryptedTaxId: "some-encrypted-value",
        },
        errorProps
      );
      fireEvent.click(screen.getByText(Config.tax.showButtonText));
      await waitFor(() => {
        expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual("123-456-789/000");
      });
      fireEvent.click(screen.getByText(Config.tax.hideButtonText));
      await waitFor(() => {
        expect(currentProfileData().taxId).toEqual("123456789000");
      });
      fireEvent.click(screen.getByText(Config.tax.showButtonText));
      await waitFor(() => {
        expect(mockApi.decryptTaxId).toHaveBeenCalledTimes(1);
      });
    });

    it("changes the tax id input type to text when show is clicked and to password when hide is clicked", async () => {
      mockApi.decryptTaxId.mockResolvedValue("123456789000");
      renderComponent(
        {
          ...profileData,
          taxId: "********9000",
          encryptedTaxId: "some-encrypted-value",
        },
        errorProps
      );
      expect((screen.getByLabelText("Tax id") as HTMLInputElement).type).toEqual("password");
      fireEvent.click(screen.getByText(Config.tax.showButtonText));
      await waitFor(() => {
        expect((screen.getByLabelText("Tax id") as HTMLInputElement).type).toEqual("text");
      });
      fireEvent.click(screen.getByText(Config.tax.hideButtonText));
      await waitFor(() => {
        expect((screen.getByLabelText("Tax id") as HTMLInputElement).type).toEqual("password");
      });
    });

    it("toggles between mobile hide and show text", async () => {
      mockApi.decryptTaxId.mockResolvedValue("123456789000");
      setLargeScreen(false);
      renderComponent(
        {
          ...profileData,
          taxId: "********9000",
          encryptedTaxId: "some-encrypted-value",
        },
        errorProps
      );
      expect(screen.queryByText(Config.tax.hideButtonTextMobile)).not.toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.tax.showButtonTextMobile));
      await waitFor(() => {
        expect(screen.getByText(Config.tax.hideButtonTextMobile)).toBeInTheDocument();
      });
    });
  });

  describe("Split TaxId Field", () => {
    it("pre-populates from profileData", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "*******8912",
        },
        errorProps
      );
      expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual("***-***-*89");
      expect((screen.getByLabelText("Tax id location") as HTMLInputElement).value).toEqual("12");
    });

    it("does not fire validation on blur of Tax id when at 9 digits", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "123456789",
        },
        errorProps
      );
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456789" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      expect(screen.queryByText(configForField.errorTextRequired)).not.toBeInTheDocument();
    });

    it("fires validation on blur of Tax id", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "123456789",
        },
        errorProps
      );
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456" },
      });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      expect(screen.getByText(configForField.errorTextRequired)).toBeInTheDocument();
    });

    it("fires validation on blur of Tax id location", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "123456789",
        },
        errorProps
      );
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
        errorProps,
        { required: true }
      );
      fireEvent.click(screen.getByLabelText("Tax id location"));
      fireEvent.blur(screen.getByLabelText("Tax id location"));
      expect(screen.getByText(configForField.errorTextRequired)).toBeInTheDocument();
    });

    it("shifts focus from Tax id to Tax id location fields", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "123456789",
        },
        errorProps
      );
      fireEvent.click(screen.getByLabelText("Tax id"));
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456789" },
      });
      expect(screen.getByLabelText("Tax id location")).toHaveFocus();
      expect(screen.queryByText(configForField.errorTextRequired)).not.toBeInTheDocument();
    });

    it("does not shift focus back from Tax id location to Tax id field", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "123456789",
        },
        errorProps
      );
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
      renderComponent(
        {
          ...profileData,
          taxId: "123456789",
        },
        errorProps
      );
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

    it("renders the hide button initially if the tax id is empty", () => {
      renderComponent(
        {
          ...profileData,
          taxId: "",
        },
        errorProps
      );
      expect(screen.getByText(Config.tax.hideButtonText)).toBeInTheDocument();
    });

    it("decrypts the tax id when show is clicked and button toggles text to hide", async () => {
      mockApi.decryptTaxId.mockResolvedValue("123456789");
      renderComponent(
        {
          ...profileData,
          taxId: "*****6789",
          encryptedTaxId: "some-encrypted-value",
        },
        errorProps
      );
      expect(screen.queryByText(Config.tax.hideButtonText)).not.toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.tax.showButtonText));
      await waitFor(() => {
        expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual("123-456-789");
      });
      expect(screen.getByText(Config.tax.hideButtonText)).toBeInTheDocument();
    });

    it("doesn't decrypt the tax id if tax id is already decrypted", async () => {
      mockApi.decryptTaxId.mockResolvedValue("123456789");
      renderComponent(
        {
          ...profileData,
          taxId: "*****6789",
          encryptedTaxId: "some-encrypted-value",
        },
        errorProps
      );
      fireEvent.click(screen.getByText(Config.tax.showButtonText));
      await waitFor(() => {
        expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual("123-456-789");
      });
      expect((screen.getByLabelText("Tax id") as HTMLInputElement).type).toEqual("text");
      fireEvent.click(screen.getByText(Config.tax.hideButtonText));
      await waitFor(() => {
        expect((screen.getByLabelText("Tax id") as HTMLInputElement).type).toEqual("password");
      });
      expect(currentProfileData().taxId).toEqual("123456789");
      fireEvent.click(screen.getByText(Config.tax.showButtonText));
      await waitFor(() => {
        expect(mockApi.decryptTaxId).toHaveBeenCalledTimes(1);
      });
    });

    it("changes the tax id input type to text when show is clicked and to password when hide is clicked", async () => {
      mockApi.decryptTaxId.mockResolvedValue("123456789000");
      renderComponent(
        {
          ...profileData,
          taxId: "*****6789",
          encryptedTaxId: "some-encrypted-value",
        },
        errorProps
      );
      expect((screen.getByLabelText("Tax id") as HTMLInputElement).type).toEqual("password");
      expect((screen.getByLabelText("Tax id location") as HTMLInputElement).type).toEqual("password");
      fireEvent.click(screen.getByText(Config.tax.showButtonText));
      await waitFor(() => {
        expect((screen.getByLabelText("Tax id") as HTMLInputElement).type).toEqual("text");
      });
      expect((screen.getByLabelText("Tax id location") as HTMLInputElement).type).toEqual("text");
      fireEvent.click(screen.getByText(Config.tax.hideButtonText));
      await waitFor(() => {
        expect((screen.getByLabelText("Tax id") as HTMLInputElement).type).toEqual("password");
      });
      expect((screen.getByLabelText("Tax id location") as HTMLInputElement).type).toEqual("password");
    });

    it("toggles between mobile hide and show text", async () => {
      mockApi.decryptTaxId.mockResolvedValue("123456789000");
      setLargeScreen(false);
      renderComponent(
        {
          ...profileData,
          taxId: "*****6789",
          encryptedTaxId: "some-encrypted-value",
        },
        errorProps
      );
      expect(screen.queryByText(Config.tax.hideButtonTextMobile)).not.toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.tax.showButtonTextMobile));
      await waitFor(() => {
        expect(screen.getByText(Config.tax.hideButtonTextMobile)).toBeInTheDocument();
      });
    });
  });
});
