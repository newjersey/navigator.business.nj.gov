import { AnytimeActionTaxClearanceCertificateElement } from "@/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificateElement";
import { generateAnytimeActionTask } from "@/test/factories";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import {
  Business,
  generateBusiness,
  generateTaxClearanceCertificateData,
  generateUserDataForBusiness,
  getTaxClearanceCertificateAgencies,
  randomElementFromArray,
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

describe("<AnyTimeActionTaxClearanceCertificateReviewElement />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
  });

  const anytimeAction = generateAnytimeActionTask({
    filename: "tax-clearance-certificate",
    name: "header",
  });

  const renderComponent = (business?: Business): void => {
    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business || generateBusiness({}))}>
        <AnytimeActionTaxClearanceCertificateElement anytimeAction={anytimeAction} />{" "}
      </WithStatefulUserData>
    );
  };

  it("renders header", () => {
    renderComponent();
    const mainHeader = screen.getByText("header");
    expect(mainHeader).toBeInTheDocument();
  });

  describe("stepper", () => {
    it("renders the requirements tab on load", () => {
      renderComponent();
      expect(screen.getByTestId("requirements-tab")).toBeInTheDocument();
    });

    it("renders the eligibility tab on click", () => {
      renderComponent();
      fireEvent.click(screen.getByTestId("stepper-1"));
      expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();
    });

    it("renders the review tab on click", () => {
      renderComponent();
      fireEvent.click(screen.getByTestId("stepper-2"));
      expect(screen.getByTestId("review-tab")).toBeInTheDocument();
    });
  });

  describe("renders data from userData", () => {
    it("renders requestingAgencyId", () => {
      const agencyId = randomElementFromArray(getTaxClearanceCertificateAgencies());
      const business = generateBusiness({
        taxClearanceCertificateData: generateTaxClearanceCertificateData({ requestingAgencyId: agencyId.id }),
      });
      renderComponent(business);
      fireEvent.click(screen.getByTestId("stepper-1"));
      expect(screen.getByText(agencyId.name)).toBeInTheDocument();
    });

    it("renders business name from userData", () => {
      const agencyId = randomElementFromArray(getTaxClearanceCertificateAgencies());
      const business = generateBusiness({
        taxClearanceCertificateData: generateTaxClearanceCertificateData({ requestingAgencyId: agencyId.id }),
      });
      renderComponent(business);
      fireEvent.click(screen.getByTestId("stepper-1"));
      expect(screen.getByText(business.profileData.businessName)).toBeInTheDocument();
    });

  });
});
