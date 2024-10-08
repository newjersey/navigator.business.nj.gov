import { ProfileAddressLockedFields } from "@/components/profile/ProfileAddressLockedFields";
import { generateAddress } from "@/test/factories";
import { WithStatefulAddressData } from "@/test/mock/withStatefulAddressData";
import { Address, emptyAddressData, Municipality } from "@businessnjgovnavigator/shared/";
import { generateMunicipality } from "@businessnjgovnavigator/shared/test";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material";
import { render, screen, within } from "@testing-library/react";

jest.mock("@mui/material", () => mockMaterialUI());

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

describe("ProfileAddressLockedFields", () => {
  const renderComponent = ({
    address,
    municipalities,
  }: {
    address?: Address;
    municipalities?: Municipality[];
  }): void => {
    render(
      <ThemeProvider theme={createTheme()}>
        <WithStatefulAddressData
          initialData={address || emptyAddressData}
          municipalities={municipalities || [generateMunicipality({})]}
        >
          <ProfileAddressLockedFields />
        </WithStatefulAddressData>
      </ThemeProvider>
    );
  };

  it("renders required profile address locked fields", () => {
    const address = generateAddress({
      addressLine1: "1111 Home Alone",
      addressLine2: "",
      addressMunicipality: generateMunicipality({ displayName: "Allendale" }),
      addressState: { shortCode: "NJ", name: "New Jersey" },
      addressZipCode: "00893",
    });
    renderComponent({ address });

    expect(screen.getByTestId("locked-profileBusinessAddressTooltip")).toBeInTheDocument();
    const addressLine1 = screen.getByTestId("locked-profileAddressLine1");
    expect(within(addressLine1).getByText("1111 Home Alone")).toBeInTheDocument();
    const addressMuniStateZip = screen.getByTestId("locked-profileAddressMuniStateZip");
    expect(within(addressMuniStateZip).getByText("Allendale, NJ 00893")).toBeInTheDocument();
    expect(screen.queryByTestId("locked-profileAddressLine2")).not.toBeInTheDocument();
  });

  it("renders profile address locked fields with Address Line 2", () => {
    const address = generateAddress({
      addressLine1: "1111 Home Alone",
      addressLine2: "Suite 10",
      addressMunicipality: generateMunicipality({ displayName: "Allendale" }),
      addressState: { shortCode: "NJ", name: "New Jersey" },
      addressZipCode: "00893",
    });
    renderComponent({ address });

    expect(screen.getByTestId("locked-profileBusinessAddressTooltip")).toBeInTheDocument();
    const addressLine1 = screen.getByTestId("locked-profileAddressLine1");
    expect(within(addressLine1).getByText("1111 Home Alone")).toBeInTheDocument();
    const addressLine2 = screen.getByTestId("locked-profileAddressLine2");
    expect(within(addressLine2).getByText("Suite 10")).toBeInTheDocument();
    const addressMuniStateZip = screen.getByTestId("locked-profileAddressMuniStateZip");
    expect(within(addressMuniStateZip).getByText("Allendale, NJ 00893")).toBeInTheDocument();
  });

  it("does not render when address fields are empty", () => {
    const address = generateAddress({
      addressLine1: "",
      addressLine2: "",
      addressMunicipality: undefined,
      addressState: undefined,
      addressZipCode: "",
    });
    renderComponent({ address });

    expect(screen.getByTestId("locked-profileBusinessAddressTooltip")).toBeInTheDocument();
    expect(screen.getByTestId("locked-profileAddressNotProvided")).toBeInTheDocument();
    expect(screen.queryByTestId("locked-profileAddressLine1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("locked-profileAddressLine2")).not.toBeInTheDocument();
    expect(screen.queryByTestId("locked-profileAddressMuniStateZip")).not.toBeInTheDocument();
  });
});
