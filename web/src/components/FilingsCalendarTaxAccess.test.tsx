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
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { FormationLegalType } from "@businessnjgovnavigator/shared/index";
import { randomInt } from "@businessnjgovnavigator/shared/intHelpers";
import { OperatingPhases } from "@businessnjgovnavigator/shared/operatingPhase";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { getCurrentDate } from "../../../shared/src/dateHelpers";
import { BusinessPersona } from "../../../shared/src/profileData";
import { generateFormationData } from "../../test/factories";
import { FilingsCalendarTaxAccess } from "./FilingsCalendarTaxAccess";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postTaxRegistrationOnboarding: jest.fn(),
  postTaxRegistrationLookup: jest.fn(),
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
  let userDataWithExternalFormation: UserData;
  let flow: Exclude<BusinessPersona, undefined>;

  beforeEach(() => {
    jest.resetAllMocks();
    const legalStructure = randomLegalStructure(true);

    mockApi.postTaxRegistrationOnboarding.mockImplementation(() =>
      Promise.resolve({
        ...userDataWithExternalFormation,
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
          businessName: userDataWithExternalFormation.profileData.businessName,
        }),
      })
    );
    userDataWithExternalFormation = generateUserData({
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
    flow = userDataWithExternalFormation.profileData.businessPersona ?? flow;
    setupStatefulUserDataContext();
  });

  it("opens Gov2Go modal when on button click", () => {
    renderFilingsCalendarTaxAccess(userDataWithExternalFormation);
    fireEvent.click(screen.getByTestId("get-tax-access"));
    expect(screen.getByTestId("modal-content")).toBeInTheDocument();
  });

  it("pre-populates fields with userData values", () => {
    renderFilingsCalendarTaxAccess({
      ...userDataWithExternalFormation,
      profileData: {
        ...userDataWithExternalFormation.profileData,
        taxId: "123456789123",
        businessName: "MrFakesHotDogBonanza",
      },
    });
    fireEvent.click(screen.getByTestId("get-tax-access"));
    expect((screen.queryByLabelText("Business name") as HTMLInputElement)?.value).toEqual(
      "MrFakesHotDogBonanza"
    );
    expect((screen.queryByLabelText("Tax id") as HTMLInputElement)?.value).toEqual("123-456-789/123");
  });

  it("makes businessName un-editable if they have completed formation with us", () => {
    renderFilingsCalendarTaxAccess({
      ...userDataWithExternalFormation,
      profileData: {
        ...userDataWithExternalFormation.profileData,
        taxId: "123456789123",
        businessName: "MrFakesHotDogBonanza",
      },
      formationData: { ...userDataWithExternalFormation.formationData, completedFilingPayment: true },
    });
    fireEvent.click(screen.getByTestId("get-tax-access"));
    expect((screen.queryByLabelText("Business name") as HTMLInputElement)?.disabled).toEqual(true);
  });

  it("displays alert on success", async () => {
    renderFilingsCalendarTaxAccess({
      ...userDataWithExternalFormation,
      profileData: {
        ...userDataWithExternalFormation.profileData,
        taxId: "123456789123",
        businessName: "MrFakesHotDogBonanza",
      },
      taxFilingData: generateTaxFilingData({ state: undefined }),
    });
    fireEvent.click(screen.getByTestId("get-tax-access"));
    fireEvent.click(screen.getByTestId("modal-button-primary"));
    await waitFor(() => expect(currentUserData().taxFilingData.state).toEqual("SUCCESS"));
    await screen.findByTestId("tax-success");
    expect(screen.getByText(Config.taxCalendar.SnackbarSuccessHeader)).toBeInTheDocument();
  });

  it("updates taxId but not BusinessName on submit", async () => {
    renderFilingsCalendarTaxAccess({
      ...userDataWithExternalFormation,
      profileData: {
        ...userDataWithExternalFormation.profileData,
        taxId: "123456789123",
        businessName: "MrFakesHotDogBonanza",
      },
    });
    mockApi.postTaxRegistrationOnboarding.mockResolvedValue({
      ...userDataWithExternalFormation,
      taxFilingData: generateTaxFilingData({
        state: "FAILED",
        businessName: userDataWithExternalFormation.profileData.businessName,
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
      ...userDataWithExternalFormation,
      profileData: {
        ...userDataWithExternalFormation.profileData,
        taxId: randomInt(12).toString(),
        businessName: "",
      },
    });
    fireEvent.click(screen.getByTestId("get-tax-access"));
    fireEvent.click(screen.getByTestId("modal-button-primary"));
    expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.ModalErrorHeader);
    expect(screen.getByText(Config.profileDefaults[flow].businessName.errorTextRequired)).toBeInTheDocument();
    expect(mockApi.postTaxRegistrationOnboarding).not.toHaveBeenCalled();
  });

  it("displays error when the businessName field is empty on blur", () => {
    renderFilingsCalendarTaxAccess({
      ...userDataWithExternalFormation,
      profileData: {
        ...userDataWithExternalFormation.profileData,
        taxId: randomInt(12).toString(),
        businessName: "MrFakesHotDogBonanza",
      },
    });
    fireEvent.click(screen.getByTestId("get-tax-access"));
    fireEvent.change(screen.getByLabelText("Business name"), { target: { value: "" } });
    fireEvent.blur(screen.getByLabelText("Business name"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText(Config.profileDefaults[flow].businessName.errorTextRequired)).toBeInTheDocument();
  });

  it("displays error when the taxId field is empty on blur", () => {
    renderFilingsCalendarTaxAccess({
      ...userDataWithExternalFormation,
      profileData: {
        ...userDataWithExternalFormation.profileData,
        taxId: randomInt(12).toString(),
        businessName: "MrFakesHotDogBonanza",
      },
    });
    fireEvent.click(screen.getByTestId("get-tax-access"));
    fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "" } });
    fireEvent.blur(screen.getByLabelText("Tax id"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText(Config.profileDefaults[flow].taxId.errorTextRequired)).toBeInTheDocument();
  });

  it("displays in-line error and alert when taxId field is invalid and save button is clicked", () => {
    renderFilingsCalendarTaxAccess({
      ...userDataWithExternalFormation,
      profileData: {
        ...userDataWithExternalFormation.profileData,
        taxId: "",
        businessName: "MrFakesHotDogBonanza",
      },
    });
    fireEvent.click(screen.getByTestId("get-tax-access"));
    fireEvent.click(screen.getByTestId("modal-button-primary"));
    expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.ModalErrorHeader);
    expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.ModalTaxErrorName);
    expect(screen.getByRole("alert")).not.toHaveTextContent(Config.taxCalendar.ModalBusinessFieldErrorName);
    expect(
      screen.queryByText(Config.profileDefaults[flow].businessName.errorTextRequired)
    ).not.toBeInTheDocument();
    expect(screen.getByText(Config.profileDefaults[flow].taxId.errorTextRequired)).toBeInTheDocument();
    expect(mockApi.postTaxRegistrationOnboarding).not.toHaveBeenCalled();
  });

  it("displays in-line error and alert when businessName field is invalid and save button is clicked", () => {
    renderFilingsCalendarTaxAccess({
      ...userDataWithExternalFormation,
      profileData: { ...userDataWithExternalFormation.profileData, taxId: "123456789123", businessName: "" },
    });
    fireEvent.click(screen.getByTestId("get-tax-access"));
    fireEvent.click(screen.getByTestId("modal-button-primary"));
    expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.ModalErrorHeader);
    expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.ModalBusinessFieldErrorName);
    expect(screen.getByRole("alert")).not.toHaveTextContent(Config.taxCalendar.ModalTaxErrorName);
    expect(screen.getByText(Config.profileDefaults[flow].businessName.errorTextRequired)).toBeInTheDocument();
    expect(screen.queryByText(Config.profileDefaults[flow].taxId.errorTextRequired)).not.toBeInTheDocument();
    expect(mockApi.postTaxRegistrationOnboarding).not.toHaveBeenCalled();
  });

  it("displays in-line error and alert when businessName field and taxId field is invalid and save button is clicked", () => {
    renderFilingsCalendarTaxAccess({
      ...userDataWithExternalFormation,
      profileData: { ...userDataWithExternalFormation.profileData, taxId: "123", businessName: "" },
    });
    fireEvent.click(screen.getByTestId("get-tax-access"));
    fireEvent.click(screen.getByTestId("modal-button-primary"));
    expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.ModalErrorHeader);
    expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.ModalBusinessFieldErrorName);
    expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.ModalTaxErrorName);
    expect(screen.getByText(Config.profileDefaults[flow].businessName.errorTextRequired)).toBeInTheDocument();
    expect(screen.getByText(Config.profileDefaults[flow].taxId.errorTextRequired)).toBeInTheDocument();
    expect(mockApi.postTaxRegistrationOnboarding).not.toHaveBeenCalled();
  });

  describe("on api failed state response", () => {
    it("displays different in-line errors and alert with full taxId field", async () => {
      renderFilingsCalendarTaxAccess({
        ...userDataWithExternalFormation,
        profileData: {
          ...userDataWithExternalFormation.profileData,
          taxId: "123456789123",
          businessName: "MrFakesHotDogBonanza",
        },
        taxFilingData: generateTaxFilingData({ state: undefined }),
      });
      mockApi.postTaxRegistrationOnboarding.mockImplementation(() =>
        Promise.resolve({
          ...userDataWithExternalFormation,
          taxFilingData: generateTaxFilingData({
            state: "FAILED",
            businessName: userDataWithExternalFormation.profileData.businessName,
          }),
        })
      );

      fireEvent.click(screen.getByTestId("get-tax-access"));
      fireEvent.click(screen.getByTestId("modal-button-primary"));
      await screen.findByRole("alert");
      expect(screen.getByRole("alert")).toHaveTextContent(
        markdownToText(Config.taxCalendar.FailedErrorMessageMarkdown)
      );
      expect(screen.getByText(Config.taxCalendar.FailedBusinessFieldHelper)).toBeInTheDocument();
      expect(screen.getByText(Config.taxCalendar.FailedTaxIdHelper)).toBeInTheDocument();
      expect(currentUserData().taxFilingData.state).toEqual("FAILED");
    });

    it("displays different in-line errors and alert with split taxId field", async () => {
      renderFilingsCalendarTaxAccess({
        ...userDataWithExternalFormation,
        profileData: {
          ...userDataWithExternalFormation.profileData,
          taxId: "123456789",
          businessName: "MrFakesHotDogBonanza",
        },
      });
      mockApi.postTaxRegistrationOnboarding.mockResolvedValue({
        ...userDataWithExternalFormation,
        taxFilingData: generateTaxFilingData({
          state: "FAILED",
          businessName: userDataWithExternalFormation.profileData.businessName,
        }),
      });
      fireEvent.click(screen.getByTestId("get-tax-access"));
      fireEvent.click(screen.getByLabelText("Tax id location"));
      fireEvent.change(screen.getByLabelText("Tax id location"), { target: { value: "123" } });
      fireEvent.click(screen.getByTestId("modal-button-primary"));
      await screen.findByRole("alert");
      expect(screen.getByRole("alert")).toHaveTextContent(
        markdownToText(Config.taxCalendar.FailedErrorMessageMarkdown)
      );
      expect(screen.getByText(Config.taxCalendar.FailedBusinessFieldHelper)).toBeInTheDocument();
      expect(screen.getByText(Config.taxCalendar.FailedTaxIdHelper)).toBeInTheDocument();
    });

    it("displays different alert with unknown request failure", async () => {
      renderFilingsCalendarTaxAccess({
        ...userDataWithExternalFormation,
        profileData: {
          ...userDataWithExternalFormation.profileData,
          taxId: "123456789123",
          businessName: "MrFakesHotDogBonanza",
        },
      });
      mockApi.postTaxRegistrationOnboarding.mockReturnValue(Promise.reject(500));
      fireEvent.click(screen.getByTestId("get-tax-access"));
      fireEvent.click(screen.getByTestId("modal-button-primary"));
      await screen.findByRole("alert");
      expect(screen.getByRole("alert")).toHaveTextContent(
        markdownToText(Config.taxCalendar.FailedUnknownMarkdown)
      );
      expect(screen.queryByText(Config.taxCalendar.FailedBusinessFieldHelper)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.taxCalendar.FailedTaxIdHelper)).not.toBeInTheDocument();
    });

    it("displays different alert with unknown api error", async () => {
      renderFilingsCalendarTaxAccess({
        ...userDataWithExternalFormation,
        profileData: {
          ...userDataWithExternalFormation.profileData,
          taxId: "123456789123",
          businessName: "MrFakesHotDogBonanza",
        },
      });
      mockApi.postTaxRegistrationOnboarding.mockResolvedValue({
        ...userDataWithExternalFormation,
        taxFilingData: generateTaxFilingData({
          state: "API_ERROR",
          businessName: userDataWithExternalFormation.profileData.businessName,
        }),
      });
      fireEvent.click(screen.getByTestId("get-tax-access"));
      fireEvent.click(screen.getByTestId("modal-button-primary"));
      await screen.findByRole("alert");
      expect(screen.getByRole("alert")).toHaveTextContent(
        markdownToText(Config.taxCalendar.FailedUnknownMarkdown)
      );
      expect(screen.queryByText(Config.taxCalendar.FailedBusinessFieldHelper)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.taxCalendar.FailedTaxIdHelper)).not.toBeInTheDocument();
    });
  });

  describe("different taxFiling states", () => {
    it("displays button if taxFiling lookup failed previously", async () => {
      renderFilingsCalendarTaxAccess({
        ...userDataWithExternalFormation,
        taxFilingData: generateTaxFilingData({
          state: "FAILED",
          businessName: userDataWithExternalFormation.profileData.businessName,
        }),
      });
      expect(screen.getByTestId("button-container")).toBeInTheDocument();
    });

    it("displays nothing if taxFiling lookup was successful", async () => {
      renderFilingsCalendarTaxAccess({
        ...userDataWithExternalFormation,
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
          businessName: userDataWithExternalFormation.profileData.businessName,
        }),
      });
      expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
      expect(screen.queryByTestId("button-container")).not.toBeInTheDocument();
    });

    describe("tax api lookup on page load and pending state", () => {
      it("displays pending message container if the taxFiling lookup was pending", async () => {
        mockApi.postTaxRegistrationLookup.mockImplementation(() =>
          Promise.resolve({
            ...userDataWithExternalFormation,
            taxFilingData: generateTaxFilingData({
              state: "PENDING",
              businessName: userDataWithExternalFormation.profileData.businessName,
            }),
          })
        );
        renderFilingsCalendarTaxAccess({
          ...userDataWithExternalFormation,
          taxFilingData: generateTaxFilingData({
            state: "PENDING",
            businessName: userDataWithExternalFormation.profileData.businessName,
            lastUpdatedISO: getCurrentDate().subtract(1, "day").toISOString(),
          }),
        });
        await waitFor(() => expect(userDataUpdatedNTimes()).toEqual(1));
        expect(screen.getByTestId("pending-container")).toBeInTheDocument();
        expect(screen.queryByTestId("button-container")).not.toBeInTheDocument();
      });

      it("updates userData and hides the container if the taxFiling lookup was successful", async () => {
        userDataWithExternalFormation = {
          ...userDataWithExternalFormation,
          taxFilingData: generateTaxFilingData({
            state: "PENDING",
            businessName: userDataWithExternalFormation.profileData.businessName,
            lastUpdatedISO: getCurrentDate().subtract(1, "day").toISOString(),
          }),
        };
        mockApi.postTaxRegistrationLookup.mockImplementation(() =>
          Promise.resolve({
            ...userDataWithExternalFormation,
            taxFilingData: generateTaxFilingData({
              state: "SUCCESS",
              businessName: userDataWithExternalFormation.profileData.businessName,
            }),
          })
        );

        renderFilingsCalendarTaxAccess(userDataWithExternalFormation);
        await waitFor(() => expect(currentUserData().taxFilingData.state).toEqual("SUCCESS"));
        expect(mockApi.postTaxRegistrationLookup).toHaveBeenCalled();
        expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
        expect(screen.queryByTestId("button-container")).not.toBeInTheDocument();
      });

      it("does not check if the lastUpdatedISO date is of the same day", async () => {
        userDataWithExternalFormation = {
          ...userDataWithExternalFormation,
          taxFilingData: generateTaxFilingData({
            state: "PENDING",
            businessName: userDataWithExternalFormation.profileData.businessName,
            lastUpdatedISO: getCurrentDate().toISOString(),
          }),
        };

        renderFilingsCalendarTaxAccess(userDataWithExternalFormation);
        await waitFor(() => expect(userDataWasNotUpdated()).toBeTruthy());

        expect(mockApi.postTaxRegistrationLookup).not.toHaveBeenCalled();
        expect(screen.getByTestId("pending-container")).toBeInTheDocument();
      });
    });
  });
});
