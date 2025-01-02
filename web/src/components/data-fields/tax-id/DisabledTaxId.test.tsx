import { DisabledTaxId } from "@/components/data-fields/tax-id/DisabledTaxId";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { generateProfileData, ProfileData } from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("@mui/material", () => mockMaterialUI());
vi.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: vi.fn() }));
vi.mock("@/lib/api-client/apiClient", () => ({
  decryptTaxId: vi.fn(),
}));
const mockApi = api as vi.Mocked<typeof api>;

const Config = getMergedConfig();

function mockMaterialUI(): typeof materialUi {
  return {
    ...vi.requireActual("@mui/material"),
    useMediaQuery: vi.fn(),
  };
}

const setLargeScreen = (value: boolean): void => {
  (useMediaQuery as vi.Mock).mockImplementation(() => {
    return value;
  });
};

const renderComponent = (profileData: ProfileData): void => {
  render(
    <WithStatefulProfileData initialData={profileData}>
      <ThemeProvider theme={createTheme()}>
        <DisabledTaxId />
      </ThemeProvider>
    </WithStatefulProfileData>
  );
};

describe("<DisabledTaxId />", () => {
  let profileData: ProfileData;

  beforeEach(() => {
    vi.resetAllMocks();
    setLargeScreen(true);
    profileData = generateProfileData({
      businessPersona: "STARTING",
    });
  });

  it("decrypts the tax id if tax id is a masked value", async () => {
    mockApi.decryptTaxId.mockResolvedValue("123456789000");
    renderComponent({
      ...profileData,
      taxId: "********9000",
      encryptedTaxId: "some-encrypted-value",
    });
    fireEvent.click(screen.getByText(Config.tax.showButtonText));
    expect(mockApi.decryptTaxId).toHaveBeenCalledWith({ encryptedTaxId: "some-encrypted-value" });
    await waitFor(() => {
      expect(screen.getByTestId("disabled-taxid")).toHaveTextContent("123-456-789/000");
    });
  });

  it("toggles between hide and show text", async () => {
    mockApi.decryptTaxId.mockResolvedValue("123456789000");
    renderComponent({
      ...profileData,
      taxId: "********9000",
      encryptedTaxId: "some-encrypted-value",
    });
    expect(screen.queryByText(Config.tax.hideButtonText)).not.toBeInTheDocument();
    expect(screen.getByTestId("disabled-tax-id-value")).toHaveTextContent("****-****-****");
    fireEvent.click(screen.getByText(Config.tax.showButtonText));
    await waitFor(() => {
      expect(screen.getByText(Config.tax.hideButtonText)).toBeInTheDocument();
    });
    expect(screen.queryByText(Config.tax.showButtonText)).not.toBeInTheDocument();
  });

  it("toggles between mobile hide and show text", async () => {
    mockApi.decryptTaxId.mockResolvedValue("123456789000");
    setLargeScreen(false);
    renderComponent({
      ...profileData,
      taxId: "********9000",
      encryptedTaxId: "some-encrypted-value",
    });
    expect(screen.queryByText(Config.tax.hideButtonTextMobile)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.tax.showButtonTextMobile));
    await waitFor(() => {
      expect(screen.getByText(Config.tax.hideButtonTextMobile)).toBeInTheDocument();
    });
    expect(screen.queryByText(Config.tax.showButtonTextMobile)).not.toBeInTheDocument();
  });
});
