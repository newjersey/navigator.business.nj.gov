import { ProfileAddressLockedFields } from "@/components/profile/ProfileAddressLockedFields";
import { generateAddress } from "@/test/factories";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { WithStatefulAddressData } from "@/test/mock/withStatefulAddressData";
import { emptyFormationAddressData, FormationAddress, Municipality } from "@businessnjgovnavigator/shared/";
import {
  generateFormationData,
  generateFormationFormData,
  generateMunicipality,
} from "@businessnjgovnavigator/shared/test";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material";
import { render, screen, within } from "@testing-library/react";

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

describe("ProfileAddressLockedFields", () => {
  beforeEach(() => {
    useMockBusiness({});
  });

  const renderComponent = ({
    address,
    municipalities,
  }: {
    address?: FormationAddress;
    municipalities?: Municipality[];
  }): void => {
    render(
      <ThemeProvider theme={createTheme()}>
        <WithStatefulAddressData
          initialData={address || emptyFormationAddressData}
          municipalities={municipalities || [generateMunicipality({})]}
        >
          <ProfileAddressLockedFields />
        </WithStatefulAddressData>
      </ThemeProvider>
    );
  };

  describe("NJ business", () => {
    it("renders required profile address locked fields", () => {
      useMockBusiness({
        formationData: generateFormationData({
          formationFormData: generateFormationFormData({
            businessLocationType: "NJ",
          }),
        }),
      });
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
      useMockBusiness({
        formationData: generateFormationData({
          formationFormData: generateFormationFormData({
            businessLocationType: "NJ",
          }),
        }),
      });

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

    it("does not render address fields when address fields are empty", () => {
      useMockBusiness({
        formationData: generateFormationData({
          formationFormData: generateFormationFormData({
            businessLocationType: undefined,
          }),
        }),
      });
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

  describe("non-NJ US business", () => {
    it("renders required profile address locked fields", () => {
      useMockBusiness({
        formationData: generateFormationData({
          formationFormData: generateFormationFormData({
            businessLocationType: "US",
          }),
        }),
      });
      const address = generateAddress({
        addressLine1: "1111 Home Alone",
        addressLine2: "",
        addressCity: "New York",
        addressState: { shortCode: "NY", name: "New York" },
        addressZipCode: "11429",
      });
      renderComponent({ address });

      expect(screen.getByTestId("locked-profileBusinessAddressTooltip")).toBeInTheDocument();
      const addressLine1 = screen.getByTestId("locked-profileAddressLine1");
      expect(within(addressLine1).getByText("1111 Home Alone")).toBeInTheDocument();
      const addressCityStateZip = screen.getByTestId("locked-profileAddressCityStateZip");
      expect(within(addressCityStateZip).getByText("New York, NY 11429")).toBeInTheDocument();
      expect(screen.queryByTestId("locked-profileAddressLine2")).not.toBeInTheDocument();
    });

    it("renders profile address locked fields with Address Line 2", () => {
      useMockBusiness({
        formationData: generateFormationData({
          formationFormData: generateFormationFormData({
            businessLocationType: "US",
          }),
        }),
      });

      const address = generateAddress({
        addressLine1: "1111 Home Alone",
        addressLine2: "Suite 10",
        addressCity: "New York",
        addressState: { shortCode: "NY", name: "New York" },
        addressZipCode: "11429",
      });
      renderComponent({ address });

      expect(screen.getByTestId("locked-profileBusinessAddressTooltip")).toBeInTheDocument();
      const addressLine1 = screen.getByTestId("locked-profileAddressLine1");
      expect(within(addressLine1).getByText("1111 Home Alone")).toBeInTheDocument();
      const addressLine2 = screen.getByTestId("locked-profileAddressLine2");
      expect(within(addressLine2).getByText("Suite 10")).toBeInTheDocument();
      const addressCityStateZip = screen.getByTestId("locked-profileAddressCityStateZip");
      expect(within(addressCityStateZip).getByText("New York, NY 11429")).toBeInTheDocument();
    });

    it("does not render address fields when address fields are empty", () => {
      useMockBusiness({
        formationData: generateFormationData({
          formationFormData: generateFormationFormData({
            businessLocationType: undefined,
          }),
        }),
      });
      const address = generateAddress({
        addressLine1: "",
        addressLine2: "",
        addressCity: undefined,
        addressState: undefined,
        addressZipCode: "",
      });
      renderComponent({ address });

      expect(screen.getByTestId("locked-profileBusinessAddressTooltip")).toBeInTheDocument();
      expect(screen.getByTestId("locked-profileAddressNotProvided")).toBeInTheDocument();
      expect(screen.queryByTestId("locked-profileAddressLine1")).not.toBeInTheDocument();
      expect(screen.queryByTestId("locked-profileAddressLine2")).not.toBeInTheDocument();
      expect(screen.queryByTestId("locked-profileAddressCityStateZip")).not.toBeInTheDocument();
    });
  });

  describe("non-NJ International business", () => {
    it("renders required profile address locked fields", () => {
      useMockBusiness({
        formationData: generateFormationData({
          formationFormData: generateFormationFormData({
            businessLocationType: "INTL",
          }),
        }),
      });
      const address = generateAddress({
        addressLine1: "1111 Home Alone",
        addressLine2: "",
        addressCity: "London",
        addressProvince: "some-Province",
        addressZipCode: "ERT45",
      });
      renderComponent({ address });

      expect(screen.getByTestId("locked-profileBusinessAddressTooltip")).toBeInTheDocument();
      const addressLine1 = screen.getByTestId("locked-profileAddressLine1");
      expect(within(addressLine1).getByText("1111 Home Alone")).toBeInTheDocument();
      const addressCityProvZip = screen.getByTestId("locked-profileAddressCityProvZip");
      expect(within(addressCityProvZip).getByText("London, some-Province ERT45")).toBeInTheDocument();
      expect(screen.queryByTestId("locked-profileAddressLine2")).not.toBeInTheDocument();
    });

    it("renders profile address locked fields with Address Line 2", () => {
      useMockBusiness({
        formationData: generateFormationData({
          formationFormData: generateFormationFormData({
            businessLocationType: "INTL",
          }),
        }),
      });

      const address = generateAddress({
        addressLine1: "1111 Home Alone",
        addressLine2: "Suite 10",
        addressCity: "London",
        addressProvince: "some-Province",
        addressZipCode: "ERT45",
      });
      renderComponent({ address });

      expect(screen.getByTestId("locked-profileBusinessAddressTooltip")).toBeInTheDocument();
      const addressLine1 = screen.getByTestId("locked-profileAddressLine1");
      expect(within(addressLine1).getByText("1111 Home Alone")).toBeInTheDocument();
      const addressLine2 = screen.getByTestId("locked-profileAddressLine2");
      expect(within(addressLine2).getByText("Suite 10")).toBeInTheDocument();
      const addressCityProvZip = screen.getByTestId("locked-profileAddressCityProvZip");
      expect(within(addressCityProvZip).getByText("London, some-Province ERT45")).toBeInTheDocument();
    });

    it("does not render address fields when address fields are empty", () => {
      useMockBusiness({
        formationData: generateFormationData({
          formationFormData: generateFormationFormData({
            businessLocationType: undefined,
          }),
        }),
      });
      const address = generateAddress({
        addressLine1: "",
        addressLine2: "",
        addressCity: "",
        addressProvince: "",
        addressZipCode: "",
      });
      renderComponent({ address });

      expect(screen.getByTestId("locked-profileBusinessAddressTooltip")).toBeInTheDocument();
      expect(screen.getByTestId("locked-profileAddressNotProvided")).toBeInTheDocument();
      expect(screen.queryByTestId("locked-profileAddressLine1")).not.toBeInTheDocument();
      expect(screen.queryByTestId("locked-profileAddressLine2")).not.toBeInTheDocument();
      expect(screen.queryByTestId("locked-profileAddressCityProvZip")).not.toBeInTheDocument();
    });
  });
});
