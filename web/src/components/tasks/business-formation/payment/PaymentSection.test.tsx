import {
  generateFormationDisplayContent,
  generateFormationFormData,
  generateFormationSubmitError,
  generateFormationSubmitResponse,
  generateUser,
  generateUserData,
} from "@/test/factories";
import {
  generateLLCProfileData,
  mockApiResponse,
  RenderedTask,
  renderTask,
  useSetupInitialMocks,
} from "@/test/helpers-formation";
import { mockPush } from "@/test/mock/mockRouter";
import { userDataUpdatedNTimes } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { BusinessUser, FormationFormData, ProfileData } from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { fireEvent, waitFor } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("next/router");
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
  searchBusinessName: jest.fn(),
}));

describe("Formation - PaymentSection", () => {
  const displayContent = generateFormationDisplayContent({
    officialFormationDocument: {
      contentMd: "Official formation document",
      cost: 125,
    },
    certificateOfStanding: {
      contentMd: "Certificate of standing",
      cost: 50,
      optionalLabel: "",
    },
    certifiedCopyOfFormationDocument: {
      contentMd: "Certified copy of formation document",
      cost: 25,
      optionalLabel: "",
    },
  });

  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const renderSection = async (
    initialProfileData: Partial<ProfileData>,
    formationFormData: Partial<FormationFormData>,
    initialUser?: Partial<BusinessUser>
  ): Promise<RenderedTask> => {
    const profileData = generateLLCProfileData(initialProfileData);
    const formationData = {
      formationFormData: generateFormationFormData(formationFormData),
      formationResponse: undefined,
      getFilingResponse: undefined,
    };
    const user = initialUser ? generateUser(initialUser) : generateUser({});
    const renderedTask = renderTask(
      generateUserData({
        profileData,
        formationData,
        user,
      }),
      displayContent
    );

    await renderedTask.page.submitBusinessNameTab();
    await renderedTask.page.submitBusinessTab();
    await renderedTask.page.submitContactsTab();
    await renderedTask.page.submitReviewTab();
    return renderedTask;
  };

  it("auto-fills fields from userData if it exists", async () => {
    const formationFormData = generateFormationFormData({
      paymentType: "CC",
      contactFirstName: `John`,
      contactLastName: `Smith`,
      contactPhoneNumber: `6024153214`,
      annualReportNotification: true,
      corpWatchNotification: true,
      officialFormationDocument: true,
      certificateOfStanding: false,
      certifiedCopyOfFormationDocument: true,
    });

    const { subject, page } = await renderSection({}, formationFormData);

    expect(
      subject.getByText(Config.businessFormationDefaults.creditCardPaymentTypeLabel)
    ).toBeInTheDocument();
    expect(page.getInputElementByLabel("Contact first name").value).toBe("John");
    expect(page.getInputElementByLabel("Contact last name").value).toBe("Smith");
    expect(page.getInputElementByLabel("Contact phone number").value).toBe("(602) 415-3214");
    expect(page.getInputElementByLabel(Config.businessFormationDefaults.optInAnnualReportText).checked).toBe(
      true
    );
    expect(page.getInputElementByLabel(Config.businessFormationDefaults.optInCorpWatchText).checked).toBe(
      true
    );
    expect(page.getInputElementByLabel("Official formation document").checked).toBe(true);
    expect(page.getInputElementByLabel("Certificate of standing").checked).toBe(false);
    expect(page.getInputElementByLabel("Certified copy of formation document").checked).toBe(true);
    expect(page.getInputElementByLabel("Credit card").checked).toBe(true);
    expect(page.getInputElementByLabel("E check").checked).toBe(false);
  });

  it("updates total and subtotals correctly", async () => {
    const { subject, page } = await renderSection(
      {},
      {
        paymentType: undefined,
        officialFormationDocument: true,
        certificateOfStanding: false,
        certifiedCopyOfFormationDocument: false,
      }
    );

    expect(subject.getByLabelText("Subtotal")).toHaveTextContent("125");
    page.selectCheckbox("Certificate of standing");
    expect(subject.getByLabelText("Subtotal")).toHaveTextContent("175");
    page.selectCheckbox("Certified copy of formation document");
    expect(subject.getByLabelText("Subtotal")).toHaveTextContent("200");
    expect(subject.getByLabelText("Total")).toHaveTextContent("200");
    page.selectCheckbox("Certificate of standing");
    expect(subject.getByLabelText("Subtotal")).toHaveTextContent("150");
    expect(subject.getByLabelText("Total")).toHaveTextContent("150");
    fireEvent.click(subject.getByLabelText("Credit card"));
    expect(subject.getByLabelText("Total")).toHaveTextContent(
      (
        150 +
        parseFloat(Config.businessFormationDefaults.creditCardPaymentCostInitial) +
        parseFloat(Config.businessFormationDefaults.creditCardPaymentCostExtra)
      ).toString()
    );
    fireEvent.click(subject.getByLabelText("E check"));
    const numberOfDocuments = 2;
    expect(subject.getByLabelText("Total")).toHaveTextContent(
      (150 + parseFloat(Config.businessFormationDefaults.achPaymentCost) * numberOfDocuments).toString()
    );
  });

  it("uses name from profile when business formation data is not set", async () => {
    const { page } = await renderSection(
      {},
      {
        contactFirstName: "",
        contactLastName: "",
      },
      { name: "Mike Jones" }
    );

    expect(page.getInputElementByLabel("Contact first name").value).toEqual("Mike");
    expect(page.getInputElementByLabel("Contact last name").value).toEqual("Jones");
  });

  it("uses name from formation data when it exists", async () => {
    const { page } = await renderSection(
      {},
      {
        contactFirstName: "Actual",
        contactLastName: "Name",
      },
      { name: "Some Wrong Name" }
    );

    expect(page.getInputElementByLabel("Contact first name").value).toEqual("Actual");
    expect(page.getInputElementByLabel("Contact last name").value).toEqual("Name");
  });

  it("redirects to payment redirect URL on success", async () => {
    mockApiResponse(
      generateFormationSubmitResponse({
        success: true,
        redirect: "www.example.com",
      })
    );

    const { page } = await renderSection({}, {});
    await page.clickSubmit();
    expect(mockPush).toHaveBeenCalledWith("www.example.com");
  });

  it("displays error messages on error and hides error when payment page is revisited", async () => {
    mockApiResponse(
      generateFormationSubmitResponse({
        success: false,
        errors: [
          generateFormationSubmitError({
            field: "some field 1",
            message: "very bad input",
            type: "RESPONSE",
          }),
          generateFormationSubmitError({
            field: "some field 2",
            message: "must be nj zipcode",
            type: "RESPONSE",
          }),
        ],
      })
    );

    const { subject, page } = await renderSection({}, {});
    await page.clickSubmit();
    expect(mockPush).not.toHaveBeenCalled();
    expect(subject.getByText("some field 1")).toBeInTheDocument();
    expect(subject.getByText("very bad input")).toBeInTheDocument();
    expect(subject.getByText("some field 2")).toBeInTheDocument();
    expect(subject.getByText("must be nj zipcode")).toBeInTheDocument();

    fireEvent.click(subject.getByText(Config.businessFormationDefaults.previousButtonText));

    await waitFor(() => {
      expect(subject.getByTestId("review-section")).toBeInTheDocument();
    });

    await page.submitReviewTab();

    expect(subject.queryByText("some field 1")).not.toBeInTheDocument();
    expect(subject.queryByText("very bad input")).not.toBeInTheDocument();
    expect(subject.queryByText("some field 2")).not.toBeInTheDocument();
    expect(subject.queryByText("must be nj zipcode")).not.toBeInTheDocument();
  });

  describe("required fields", () => {
    it("Contact first name", async () => {
      const { page } = await renderSection({}, { contactFirstName: "" }, { name: "" });
      await page.clickSubmit();
      expect(userDataUpdatedNTimes()).toEqual(3);
    });

    it("Contact last name", async () => {
      const { page } = await renderSection({}, { contactLastName: "" }, { name: "" });
      await page.clickSubmit();
      expect(userDataUpdatedNTimes()).toEqual(3);
    });

    it("Contact phone number", async () => {
      const { page } = await renderSection({}, { contactPhoneNumber: "" });
      await page.clickSubmit();
      expect(userDataUpdatedNTimes()).toEqual(3);
    });

    it("Payment type", async () => {
      const { subject, page } = await renderSection({}, { paymentType: undefined });
      await page.clickSubmit();
      expect(subject.getByText(Config.businessFormationDefaults.paymentTypeErrorText)).toBeInTheDocument();
      expect(userDataUpdatedNTimes()).toEqual(3);
    });
  });
});
