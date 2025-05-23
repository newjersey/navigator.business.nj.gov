import { DisabledTaxId } from "@/components/data-fields/tax-id/DisabledTaxId";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { generateProfileData, ProfileData } from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
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

const renderComponent = (profileData: ProfileData): void => {
  render(
    <WithStatefulProfileData initialData={profileData}>
      <ThemeProvider theme={createTheme()}>
        <DisabledTaxId />
      </ThemeProvider>
    </WithStatefulProfileData>,
  );
};

describe("<DisabledTaxId />", () => {
  let profileData: ProfileData;

  beforeEach(() => {
    jest.resetAllMocks();
    setLargeScreen(true);
    profileData = generateProfileData({
      businessPersona: "STARTING",
    });
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
      expect(screen.getByTestId("disabled-taxid")).toHaveTextContent("123-456-789/000");
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
    expect(screen.getByTestId("disabled-tax-id-value")).toHaveTextContent("****-****-****");
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
