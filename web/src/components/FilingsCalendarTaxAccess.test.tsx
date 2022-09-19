import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import {
  generateProfileData,
  generateTaxFilingData,
  generateUserData,
  randomLegalStructure,
} from "@/test/factories";
import { markdownToText, randomElementFromArray } from "@/test/helpers";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataUpdatedNTimes,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { FormationLegalType } from "@businessnjgovnavigator/shared/index";
import { randomInt } from "@businessnjgovnavigator/shared/intHelpers";
import { OperatingPhases } from "@businessnjgovnavigator/shared/operatingPhase";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BusinessPersona } from "../../../shared/src/profileData";
import { generateFormationData } from "../../test/factories";
import { FilingsCalendarTaxAccess } from "./FilingsCalendarTaxAccess";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postTaxRegistrationOnboarding: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

const Config = getMergedConfig();

const renderFilingsCalendarTaxAccess = (initialUserData?: UserData) => {
  render(
    <WithStatefulUserData initialUserData={initialUserData}>
      <FilingsCalendarTaxAccess />
    </WithStatefulUserData>
  );
};

describe("<FilingsCalendarTaxAccess />", () => {
  let userData: UserData;
  let flow: Exclude<BusinessPersona, undefined>;

  beforeEach(() => {
    jest.resetAllMocks();
    const legalStructure = randomLegalStructure(true);
    mockApi.postTaxRegistrationOnboarding.mockImplementation(() =>
      Promise.resolve({
        ...userData,
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
          businessName: userData.profileData.businessName,
        }),
      })
    );
    userData = generateUserData({
      profileData: generateProfileData({
        legalStructureId: legalStructure.id,
        operatingPhase: randomElementFromArray(
          OperatingPhases.filter((obj) => obj.displayTaxAccessButton === true)
        ).id,
      }),
      formationData: generateFormationData(
        { completedFilingPayment: false },
        legalStructure.id as FormationLegalType
      ),
    });
    flow = userData.profileData.businessPersona ?? flow;
    setupStatefulUserDataContext();
  });

  it("does not render component when feature flag is disabled", async () => {
    process.env.FEATURE_TAX_CALENDAR = "false";
    renderFilingsCalendarTaxAccess(userData);
    expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
    expect(screen.queryByTestId("button-container")).not.toBeInTheDocument();
    process.env.FEATURE_TAX_CALENDAR = "true";
  });

  it("opens Gov2Go modal when on button click", () => {
    renderFilingsCalendarTaxAccess(userData);
    fireEvent.click(screen.getByTestId("get-tax-access"));
    expect(screen.getByTestId("modal-content")).toBeInTheDocument();
  });

  it("Pre-populates fields with userData values", async () => {
    renderFilingsCalendarTaxAccess({
      ...userData,
      profileData: { ...userData.profileData, taxId: "123456789123", businessName: "1234" },
    });
    fireEvent.click(screen.getByTestId("get-tax-access"));
    expect((screen.queryByLabelText("Business name") as HTMLInputElement)?.value).toEqual("1234");
    expect((screen.queryByLabelText("Tax id") as HTMLInputElement)?.value).toEqual("123-456-789/123");
  });

  it("makes businessName un-editable if they have completed formation with us", async () => {
    renderFilingsCalendarTaxAccess({
      ...userData,
      profileData: { ...userData.profileData, taxId: "123456789123", businessName: "1234" },
      formationData: { ...userData.formationData, completedFilingPayment: true },
    });
    fireEvent.click(screen.getByTestId("get-tax-access"));
    expect((screen.queryByLabelText("Business name") as HTMLInputElement)?.disabled).toEqual(true);
  });

  it("displays alert on success", async () => {
    renderFilingsCalendarTaxAccess({
      ...userData,
      profileData: { ...userData.profileData, taxId: "123456789123", businessName: "1234" },
      taxFilingData: generateTaxFilingData({ state: undefined }),
    });
    fireEvent.click(screen.getByTestId("get-tax-access"));
    fireEvent.click(screen.getByTestId("modal-button-primary"));
    await waitFor(() => expect(currentUserData().taxFilingData.state).toEqual("SUCCESS"));
    await screen.findByTestId("tax-success");
    expect(screen.getByText(Config.dashboardDefaults.taxCalendarSnackbarSuccessHeader)).toBeInTheDocument();
  });

  it("updates taxId but not BusinessName on submit", async () => {
    renderFilingsCalendarTaxAccess({
      ...userData,
      profileData: { ...userData.profileData, taxId: "123456789123", businessName: "1234" },
    });
    mockApi.postTaxRegistrationOnboarding.mockResolvedValue({
      ...userData,
      taxFilingData: generateTaxFilingData({
        state: "FAILED",
        businessName: userData.profileData.businessName,
      }),
    });
    fireEvent.click(screen.getByTestId("get-tax-access"));
    fireEvent.change(screen.getByLabelText("Business name"), {
      target: { value: "zoom" },
    });
    fireEvent.change(screen.getByLabelText("Tax id"), {
      target: { value: "123456789000" },
    });
    fireEvent.click(screen.getByTestId("modal-button-primary"));
    await waitFor(() => expect(currentUserData().profileData.businessName).not.toEqual("zoom"));
    await waitFor(() => expect(currentUserData().profileData.taxId).toEqual("123456789000"));
  });

  it("displays in-line error and alert when businessName field is empty and save button is clicked", () => {
    renderFilingsCalendarTaxAccess({
      ...userData,
      profileData: { ...userData.profileData, taxId: randomInt(12).toString(), businessName: "" },
    });
    fireEvent.click(screen.getByTestId("get-tax-access"));
    fireEvent.click(screen.getByTestId("modal-button-primary"));
    expect(screen.getByRole("alert")).toHaveTextContent(Config.dashboardDefaults.taxCalendarModalErrorHeader);
    expect(screen.getByText(Config.profileDefaults[flow].businessName.errorTextRequired)).toBeInTheDocument();
  });

  it("displays error when the businessName field is empty on blur", () => {
    renderFilingsCalendarTaxAccess({
      ...userData,
      profileData: { ...userData.profileData, taxId: randomInt(12).toString(), businessName: "1234" },
    });
    fireEvent.click(screen.getByTestId("get-tax-access"));
    fireEvent.change(screen.getByLabelText("Business name"), { target: { value: "" } });
    fireEvent.blur(screen.getByLabelText("Business name"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText(Config.profileDefaults[flow].businessName.errorTextRequired)).toBeInTheDocument();
  });

  it("displays error when the taxId field is empty on blur", () => {
    renderFilingsCalendarTaxAccess({
      ...userData,
      profileData: { ...userData.profileData, taxId: randomInt(12).toString(), businessName: "1234" },
    });
    fireEvent.click(screen.getByTestId("get-tax-access"));
    fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "" } });
    fireEvent.blur(screen.getByLabelText("Tax id"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText(Config.profileDefaults[flow].taxId.errorTextRequired)).toBeInTheDocument();
  });

  it("displays in-line error and alert when taxId field is invalid and save button is clicked", () => {
    renderFilingsCalendarTaxAccess({
      ...userData,
      profileData: { ...userData.profileData, taxId: "", businessName: "1234" },
    });
    fireEvent.click(screen.getByTestId("get-tax-access"));
    fireEvent.click(screen.getByTestId("modal-button-primary"));
    expect(screen.getByRole("alert")).toHaveTextContent(Config.dashboardDefaults.taxCalendarModalErrorHeader);
    expect(screen.getByRole("alert")).toHaveTextContent(
      Config.dashboardDefaults.taxCalendarModalTaxErrorName
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent(
      Config.dashboardDefaults.taxCalendarModalBusinessFieldErrorName
    );
    expect(
      screen.queryByText(Config.profileDefaults[flow].businessName.errorTextRequired)
    ).not.toBeInTheDocument();
    expect(screen.getByText(Config.profileDefaults[flow].taxId.errorTextRequired)).toBeInTheDocument();
  });

  it("displays in-line error and alert when businessName field is invalid and save button is clicked", () => {
    renderFilingsCalendarTaxAccess({
      ...userData,
      profileData: { ...userData.profileData, taxId: "123456789123", businessName: "" },
    });
    fireEvent.click(screen.getByTestId("get-tax-access"));
    fireEvent.click(screen.getByTestId("modal-button-primary"));
    expect(screen.getByRole("alert")).toHaveTextContent(Config.dashboardDefaults.taxCalendarModalErrorHeader);
    expect(screen.getByRole("alert")).toHaveTextContent(
      Config.dashboardDefaults.taxCalendarModalBusinessFieldErrorName
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent(
      Config.dashboardDefaults.taxCalendarModalTaxErrorName
    );
    expect(screen.getByText(Config.profileDefaults[flow].businessName.errorTextRequired)).toBeInTheDocument();
    expect(screen.queryByText(Config.profileDefaults[flow].taxId.errorTextRequired)).not.toBeInTheDocument();
  });

  it("displays in-line error and alert when businessName field and taxId field is invalid and save button is clicked", () => {
    renderFilingsCalendarTaxAccess({
      ...userData,
      profileData: { ...userData.profileData, taxId: "123", businessName: "" },
    });
    fireEvent.click(screen.getByTestId("get-tax-access"));
    fireEvent.click(screen.getByTestId("modal-button-primary"));
    expect(screen.getByRole("alert")).toHaveTextContent(Config.dashboardDefaults.taxCalendarModalErrorHeader);
    expect(screen.getByRole("alert")).toHaveTextContent(
      Config.dashboardDefaults.taxCalendarModalBusinessFieldErrorName
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      Config.dashboardDefaults.taxCalendarModalTaxErrorName
    );
    expect(screen.getByText(Config.profileDefaults[flow].businessName.errorTextRequired)).toBeInTheDocument();
    expect(screen.getByText(Config.profileDefaults[flow].taxId.errorTextRequired)).toBeInTheDocument();
  });

  describe("on api failed state response", () => {
    it("displays different in-line errors and alert with full taxId field", async () => {
      renderFilingsCalendarTaxAccess({
        ...userData,
        profileData: { ...userData.profileData, taxId: "123456789123", businessName: "1234" },
        taxFilingData: generateTaxFilingData({ state: undefined }),
      });
      mockApi.postTaxRegistrationOnboarding.mockImplementation(() =>
        Promise.resolve({
          ...userData,
          taxFilingData: generateTaxFilingData({
            state: "FAILED",
            businessName: userData.profileData.businessName,
          }),
        })
      );

      fireEvent.click(screen.getByTestId("get-tax-access"));
      fireEvent.click(screen.getByTestId("modal-button-primary"));
      await screen.findByRole("alert");
      expect(screen.getByRole("alert")).toHaveTextContent(
        markdownToText(Config.dashboardDefaults.taxCalendarFailedErrorMessageMarkdown)
      );
      expect(
        screen.getByText(Config.dashboardDefaults.taxCalendarFailedBusinessFieldHelper)
      ).toBeInTheDocument();
      expect(screen.getByText(Config.dashboardDefaults.taxCalendarFailedTaxIdHelper)).toBeInTheDocument();
      expect(currentUserData().taxFilingData.state).toEqual("FAILED");
    });

    it("displays different in-line errors and alert with split taxId field", async () => {
      renderFilingsCalendarTaxAccess({
        ...userData,
        profileData: { ...userData.profileData, taxId: "123456789", businessName: "1234" },
      });
      mockApi.postTaxRegistrationOnboarding.mockResolvedValue({
        ...userData,
        taxFilingData: generateTaxFilingData({
          state: "FAILED",
          businessName: userData.profileData.businessName,
        }),
      });
      fireEvent.click(screen.getByTestId("get-tax-access"));
      fireEvent.click(screen.getByLabelText("Tax id location"));
      fireEvent.change(screen.getByLabelText("Tax id location"), { target: { value: "123" } });
      fireEvent.click(screen.getByTestId("modal-button-primary"));
      await screen.findByRole("alert");
      expect(screen.getByRole("alert")).toHaveTextContent(
        markdownToText(Config.dashboardDefaults.taxCalendarFailedErrorMessageMarkdown)
      );
      expect(
        screen.getByText(Config.dashboardDefaults.taxCalendarFailedBusinessFieldHelper)
      ).toBeInTheDocument();
      expect(screen.getByText(Config.dashboardDefaults.taxCalendarFailedTaxIdHelper)).toBeInTheDocument();
    });

    it("displays different alert with unknown request failure", async () => {
      renderFilingsCalendarTaxAccess({
        ...userData,
        profileData: { ...userData.profileData, taxId: "123456789123", businessName: "1234" },
      });
      mockApi.postTaxRegistrationOnboarding.mockReturnValue(Promise.reject(500));
      fireEvent.click(screen.getByTestId("get-tax-access"));
      fireEvent.click(screen.getByTestId("modal-button-primary"));
      await screen.findByRole("alert");
      expect(screen.getByRole("alert")).toHaveTextContent(
        markdownToText(Config.dashboardDefaults.taxCalendarFailedUnknownMarkdown)
      );
      expect(
        screen.queryByText(Config.dashboardDefaults.taxCalendarFailedBusinessFieldHelper)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(Config.dashboardDefaults.taxCalendarFailedTaxIdHelper)
      ).not.toBeInTheDocument();
    });

    it("displays different alert with unknown api error", async () => {
      renderFilingsCalendarTaxAccess({
        ...userData,
        profileData: { ...userData.profileData, taxId: "123456789123", businessName: "1234" },
      });
      mockApi.postTaxRegistrationOnboarding.mockResolvedValue({
        ...userData,
        taxFilingData: generateTaxFilingData({
          state: "API_ERROR",
          businessName: userData.profileData.businessName,
        }),
      });
      fireEvent.click(screen.getByTestId("get-tax-access"));
      fireEvent.click(screen.getByTestId("modal-button-primary"));
      await screen.findByRole("alert");
      expect(screen.getByRole("alert")).toHaveTextContent(
        markdownToText(Config.dashboardDefaults.taxCalendarFailedUnknownMarkdown)
      );
      expect(
        screen.queryByText(Config.dashboardDefaults.taxCalendarFailedBusinessFieldHelper)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(Config.dashboardDefaults.taxCalendarFailedTaxIdHelper)
      ).not.toBeInTheDocument();
    });
  });

  describe("different taxFiling states", () => {
    it("displays nothing if taxFiling lookup was successful", async () => {
      renderFilingsCalendarTaxAccess({
        ...userData,
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
          businessName: userData.profileData.businessName,
        }),
      });
      expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
      expect(screen.queryByTestId("button-container")).not.toBeInTheDocument();
    });

    it("displays pending message container if taxFiling lookup was pending", async () => {
      mockApi.postTaxRegistrationOnboarding.mockImplementation(() =>
        Promise.resolve({
          ...userData,
          taxFilingData: generateTaxFilingData({
            state: "PENDING",
            businessName: userData.profileData.businessName,
          }),
        })
      );
      renderFilingsCalendarTaxAccess({
        ...userData,
        taxFilingData: generateTaxFilingData({
          state: "PENDING",
          businessName: userData.profileData.businessName,
        }),
      });
      await waitFor(() => expect(userDataUpdatedNTimes()).toEqual(1));
      expect(screen.getByTestId("pending-container")).toBeInTheDocument();
      expect(screen.queryByTestId("button-container")).not.toBeInTheDocument();
    });

    it("checks the api when user loads the page if they are in a pending state and updates userData", async () => {
      userData = {
        ...userData,
        taxFilingData: generateTaxFilingData({
          state: "PENDING",
          businessName: userData.profileData.businessName,
        }),
      };
      renderFilingsCalendarTaxAccess(userData);
      await waitFor(() => expect(currentUserData().taxFilingData.state).toEqual("SUCCESS"));
      expect(mockApi.postTaxRegistrationOnboarding).toHaveBeenCalled();
      expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
      expect(screen.queryByTestId("button-container")).not.toBeInTheDocument();
    });

    it("displays button if taxFiling lookup failed previously", async () => {
      renderFilingsCalendarTaxAccess({
        ...userData,
        taxFilingData: generateTaxFilingData({
          state: "FAILED",
          businessName: userData.profileData.businessName,
        }),
      });
      expect(screen.getByTestId("button-container")).toBeInTheDocument();
    });

    it("displays button if taxFiling lookup when unset", async () => {
      renderFilingsCalendarTaxAccess({
        ...userData,
        taxFilingData: generateTaxFilingData({ state: undefined }),
      });
      expect(screen.getByTestId("button-container")).toBeInTheDocument();
    });
  });
});
