import { getMergedConfig } from "@/contexts/configContext";
import { generateAddress } from "@/test/factories";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import {
  emptyFormationAddressData,
} from "@businessnjgovnavigator/shared/formationData";
import {
  generateBusiness,
  generateFormationData,
  generateFormationFormData,
} from "@businessnjgovnavigator/shared/test";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material";
import { render, screen } from "@testing-library/react";
import {WithStatefulTaxCertificateData} from "@/test/mock/withStatefulTaxCertificateData";
import {
  TaxClearanceCertificateEligibility
} from "@/components/tasks/tax-clearance-certificate/TaxClearanceCertificateEligibility";


jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@mui/material", () => mockMaterialUI());

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

describe("<TaxClearanceCertificateEligibility  />", () => {
  const Config = getMergedConfig();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const renderComponent = (): void => {
    render(
      <ThemeProvider theme={createTheme()}>
        <WithStatefulTaxCertificateData
          initialData={emptyFormationAddressData}
        >
          <TaxClearanceCertificateEligibility />
        </WithStatefulTaxCertificateData>
      </ThemeProvider>
    );
  };

  it("renders tax clearance eligibility", () => {
    const address = generateAddress({
      addressLine1: "1111 Home Alone",
    });
    useMockBusiness(
      generateBusiness({
        formationData: generateFormationData({
          completedFilingPayment: false,
          formationFormData: generateFormationFormData({ ...address }),
        }),
      })
    );
    renderComponent();
    expect(screen.getByText(Config.taxClearanceCertificateTask.certificationReasonLabel)).toBeInTheDocument();
  });
});


