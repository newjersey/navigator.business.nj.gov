import { FilingsCalendarTaxAccess } from "@/components/FilingsCalendarTaxAccess";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import {
  generateFormationData,
  generateProfileData,
  generateTaxFilingData,
  generateUserData,
  randomLegalStructure,
} from "@/test/factories";
import { withAuthAlert } from "@/test/helpers/helpers-renderers";
import { markdownToText, randomElementFromArray } from "@/test/helpers/helpers-utilities";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataUpdatedNTimes,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  BusinessPersona,
  FormationLegalType,
  getCurrentDateISOString,
  OperatingPhases,
  randomInt,
  UserData,
} from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
jest.mock("@/lib/data-hooks/useRoadmap", () => {
  return { useRoadmap: jest.fn() };
});
jest.mock("@/lib/api-client/apiClient", () => {
  return {
    postTaxRegistrationOnboarding: jest.fn(),
    postTaxRegistrationLookup: jest.fn(),
  };
});
jest.mock("next/router", () => {
  return { useRouter: jest.fn() };
});
const mockApi = api as jest.Mocked<typeof api>;

const Config = getMergedConfig();
let setRegistrationModalIsVisible: jest.Mock;

const renderFilingsCalendarTaxAccess = (initialUserData?: UserData) => {
  render(
    <WithStatefulUserData initialUserData={initialUserData}>
      <FilingsCalendarTaxAccess />
    </WithStatefulUserData>
  );
};

const renderUnauthenticatedFilingsCalendarTaxAccess = (initialUserData?: UserData) => {
  render(
    withAuthAlert(
      <WithStatefulUserData initialUserData={initialUserData}>
        <FilingsCalendarTaxAccess />
      </WithStatefulUserData>,
      IsAuthenticated.FALSE,
      { registrationModalIsVisible: false, setRegistrationModalIsVisible }
    )
  );
};

describe("<FilingsCalendarTaxAccess />", () => {
  let userDataWithExternalFormation: UserData;
  let flow: Exclude<BusinessPersona, undefined>;

  beforeEach(() => {
    jest.resetAllMocks();
    setRegistrationModalIsVisible = jest.fn();
    const legalStructure = randomLegalStructure({ requiresPublicFiling: true });

    mockApi.postTaxRegistrationOnboarding.mockImplementation(() => {
      return Promise.resolve({
        ...userDataWithExternalFormation,
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
          registeredISO: getCurrentDateISOString(),
          businessName: userDataWithExternalFormation.profileData.businessName,
        }),
      });
    });
    userDataWithExternalFormation = generateUserData({
      profileData: generateProfileData({
        legalStructureId: legalStructure.id,
        operatingPhase: randomElementFromArray(
          OperatingPhases.filter((obj) => {
            return obj.displayTaxAccessButton === true;
          })
        ).id,
      }),
      formationData: generateFormationData(
        { completedFilingPayment: false },
        legalStructure.id as FormationLegalType
      ),
    });
    flow = userDataWithExternalFormation.profileData.businessPersona ?? flow;
    setupStatefulUserDataContext();
    useMockRouter({});
  });

  it("opens Gov2Go modal when on button click", () => {
    renderFilingsCalendarTaxAccess(userDataWithExternalFormation);
    fireEvent.click(screen.getByTestId("get-tax-access"));
    expect(screen.getByTestId("modal-content")).toBeInTheDocument();
  });

  it("opens the sign up modal when button is clicked in up and running guest mode for non sp/gp instead of tax modal", async () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        legalStructureId: randomLegalStructure({ requiresPublicFiling: true }).id,
        operatingPhase: "GUEST_MODE_OWNING",
      }),
    });

    renderUnauthenticatedFilingsCalendarTaxAccess(userData);
    expect(screen.getByTestId("get-tax-access")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("get-tax-access"));
    expect(screen.queryByTestId("modal-content")).not.toBeInTheDocument();
    await waitFor(() => {
      return expect(setRegistrationModalIsVisible).toHaveBeenCalledWith(true);
    });
  });

  it("updates userData with return link when the button is clicked in up and running guest mode", async () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        legalStructureId: randomLegalStructure({ requiresPublicFiling: true }).id,
        operatingPhase: "GUEST_MODE_OWNING",
      }),
    });
    renderUnauthenticatedFilingsCalendarTaxAccess(userData);
    expect(screen.getByTestId("get-tax-access")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("get-tax-access"));
    await waitFor(() => {
      return expect(currentUserData().preferences.returnToLink).toEqual(
        `${ROUTES.dashboard}?${QUERIES.openTaxFilingsModal}=true`
      );
    });
  });

  it("opens tax modal if the query parameter openTaxFilingsModal is true and shallow reloads", async () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        legalStructureId: randomLegalStructure({ requiresPublicFiling: true }).id,
        operatingPhase: "GUEST_MODE_OWNING",
      }),
    });
    useMockRouter({ query: { openTaxFilingsModal: "true" }, isReady: true });
    renderFilingsCalendarTaxAccess(userData);
    await screen.findByTestId("modal-content");
    expect(mockPush).toHaveBeenCalledWith({ pathname: ROUTES.dashboard }, undefined, { shallow: true });
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

  it("calls the postRegistrationLookup method with the encrypted tax id", async () => {
    renderFilingsCalendarTaxAccess({
      ...userDataWithExternalFormation,
      taxFilingData: generateTaxFilingData({
        registeredISO: getCurrentDateISOString(),
        businessName: userDataWithExternalFormation.profileData.businessName,
      }),
      profileData: {
        ...userDataWithExternalFormation.profileData,
        encryptedTaxId: "some-encrypted-value",
        taxId: "*******89000",
      },
    });
    await waitFor(() => {
      return expect(mockApi.postTaxRegistrationLookup).toHaveBeenCalledWith({
        encryptedTaxId: "some-encrypted-value",
        taxId: "*******89000",
        businessName: userDataWithExternalFormation.profileData.businessName,
      });
    });
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
    await waitFor(() => {
      return expect(currentUserData().taxFilingData.state).toEqual("SUCCESS");
    });
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
    await waitFor(() => {
      return expect(currentUserData().profileData.businessName).not.toEqual("zoom");
    });
    await waitFor(() => {
      return expect(currentUserData().profileData.taxId).toEqual("123456789000");
    });
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
    expect(
      screen.getByText(Config.profileDefaults.fields.businessName.default.errorTextRequired)
    ).toBeInTheDocument();
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
    expect(
      screen.getByText(Config.profileDefaults.fields.businessName.default.errorTextRequired)
    ).toBeInTheDocument();
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
    expect(
      screen.getByText(Config.profileDefaults.fields.taxId.default.errorTextRequired)
    ).toBeInTheDocument();
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
      screen.queryByText(Config.profileDefaults.fields.businessName.default.errorTextRequired)
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(Config.profileDefaults.fields.taxId.default.errorTextRequired)
    ).toBeInTheDocument();
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
    expect(
      screen.getByText(Config.profileDefaults.fields.businessName.default.errorTextRequired)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(Config.profileDefaults.fields.taxId.default.errorTextRequired)
    ).not.toBeInTheDocument();
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
    expect(
      screen.getByText(Config.profileDefaults.fields.businessName.default.errorTextRequired)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.profileDefaults.fields.taxId.default.errorTextRequired)
    ).toBeInTheDocument();
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
      mockApi.postTaxRegistrationOnboarding.mockImplementation(() => {
        return Promise.resolve({
          ...userDataWithExternalFormation,
          taxFilingData: generateTaxFilingData({
            state: "FAILED",
            businessName: userDataWithExternalFormation.profileData.businessName,
          }),
        });
      });

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

  describe("different taxFiling states and update behavior", () => {
    it("does not do taxFiling lookup on page load if not registered", async () => {
      renderFilingsCalendarTaxAccess({
        ...userDataWithExternalFormation,
        taxFilingData: generateTaxFilingData({
          registeredISO: undefined,
          businessName: userDataWithExternalFormation.profileData.businessName,
        }),
      });
      expect(mockApi.postTaxRegistrationLookup).not.toHaveBeenCalled();
    });

    it("does taxFiling lookup on page load if registered", async () => {
      renderFilingsCalendarTaxAccess({
        ...userDataWithExternalFormation,
        taxFilingData: generateTaxFilingData({
          registeredISO: getCurrentDateISOString(),
          businessName: userDataWithExternalFormation.profileData.businessName,
        }),
      });
      expect(mockApi.postTaxRegistrationLookup).toHaveBeenCalled();
      await waitFor(() => {
        return expect(userDataUpdatedNTimes()).toEqual(1);
      });
    });

    it("shows button component when state is FAILED and unregistered", async () => {
      renderFilingsCalendarTaxAccess({
        ...userDataWithExternalFormation,
        taxFilingData: generateTaxFilingData({
          state: "FAILED",
          registeredISO: undefined,
          businessName: userDataWithExternalFormation.profileData.businessName,
        }),
      });
      expect(mockApi.postTaxRegistrationLookup).not.toHaveBeenCalled();
      expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
      expect(screen.getByTestId("button-container")).toBeInTheDocument();
    });

    it("shows button component when state is undefined and unregistered", async () => {
      renderFilingsCalendarTaxAccess({
        ...userDataWithExternalFormation,
        taxFilingData: generateTaxFilingData({
          state: undefined,
          registeredISO: undefined,
          businessName: userDataWithExternalFormation.profileData.businessName,
        }),
      });
      expect(mockApi.postTaxRegistrationLookup).not.toHaveBeenCalled();
      expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
      expect(screen.getByTestId("button-container")).toBeInTheDocument();
    });

    it("hides pending and button components when state is SUCCESS", async () => {
      mockApi.postTaxRegistrationLookup.mockImplementation(() => {
        return Promise.resolve({
          ...userDataWithExternalFormation,
          taxFilingData: generateTaxFilingData({
            registeredISO: getCurrentDateISOString(),
            state: "SUCCESS",
            businessName: userDataWithExternalFormation.profileData.businessName,
          }),
        });
      });
      renderFilingsCalendarTaxAccess({
        ...userDataWithExternalFormation,
        taxFilingData: generateTaxFilingData({
          registeredISO: getCurrentDateISOString(),
          state: "PENDING",
          businessName: userDataWithExternalFormation.profileData.businessName,
        }),
      });
      expect(mockApi.postTaxRegistrationLookup).toHaveBeenCalled();
      await waitFor(() => {
        return expect(userDataUpdatedNTimes()).toEqual(1);
      });
      await waitFor(() => {
        return expect(currentUserData().taxFilingData.state).toEqual("SUCCESS");
      });
      expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
      expect(screen.queryByTestId("button-container")).not.toBeInTheDocument();
    });

    it("hides pending and button components when state is API_ERROR but registered", async () => {
      mockApi.postTaxRegistrationLookup.mockImplementation(() => {
        return Promise.resolve({
          ...userDataWithExternalFormation,
          taxFilingData: generateTaxFilingData({
            registeredISO: getCurrentDateISOString(),
            state: "API_ERROR",
            businessName: userDataWithExternalFormation.profileData.businessName,
          }),
        });
      });
      renderFilingsCalendarTaxAccess({
        ...userDataWithExternalFormation,
        taxFilingData: generateTaxFilingData({
          registeredISO: getCurrentDateISOString(),
          state: "PENDING",
          businessName: userDataWithExternalFormation.profileData.businessName,
        }),
      });
      expect(mockApi.postTaxRegistrationLookup).toHaveBeenCalled();
      await waitFor(() => {
        return expect(userDataUpdatedNTimes()).toEqual(1);
      });
      await waitFor(() => {
        return expect(currentUserData().taxFilingData.state).toEqual("API_ERROR");
      });
      expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
      expect(screen.queryByTestId("button-container")).not.toBeInTheDocument();
    });

    it("shows registration followup component when state is SUCCESS but it's before the Saturday after registration", async () => {
      const userData = {
        ...userDataWithExternalFormation,
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
          registeredISO: getCurrentDateISOString(),
          businessName: userDataWithExternalFormation.profileData.businessName,
        }),
      };
      mockApi.postTaxRegistrationLookup.mockImplementation(() => {
        return Promise.resolve(userData);
      });
      renderFilingsCalendarTaxAccess({
        ...userDataWithExternalFormation,
        taxFilingData: generateTaxFilingData({
          state: "PENDING",
          registeredISO: getCurrentDateISOString(),
          businessName: userDataWithExternalFormation.profileData.businessName,
        }),
      });
      await waitFor(() => {
        return expect(userDataUpdatedNTimes()).toEqual(1);
      });
      expect(screen.queryByTestId("get-tax-access")).not.toBeInTheDocument();
      expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
      expect(screen.queryByTestId("button-container")).not.toBeInTheDocument();
      expect(screen.getByTestId("alert-content-container")).toBeInTheDocument();
    });

    it("shows pending component when state is PENDING", async () => {
      mockApi.postTaxRegistrationLookup.mockImplementation(() => {
        return Promise.resolve({
          ...userDataWithExternalFormation,
          taxFilingData: generateTaxFilingData({
            state: "PENDING",
            registeredISO: getCurrentDateISOString(),
            businessName: userDataWithExternalFormation.profileData.businessName,
          }),
        });
      });

      renderFilingsCalendarTaxAccess({
        ...userDataWithExternalFormation,
        taxFilingData: generateTaxFilingData({
          state: "API_ERROR",
          registeredISO: getCurrentDateISOString(),
          businessName: userDataWithExternalFormation.profileData.businessName,
        }),
      });
      expect(mockApi.postTaxRegistrationLookup).toHaveBeenCalled();
      await waitFor(() => {
        return expect(userDataUpdatedNTimes()).toEqual(1);
      });
      await waitFor(() => {
        return expect(currentUserData().taxFilingData.state).toEqual("PENDING");
      });
      expect(screen.getByTestId("pending-container")).toBeInTheDocument();
      expect(screen.queryByTestId("button-container")).not.toBeInTheDocument();
      expect(screen.queryByTestId("alert-content-container")).not.toBeInTheDocument();
    });
  });
});
