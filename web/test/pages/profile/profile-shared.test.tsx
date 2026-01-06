/* eslint-disable jest/expect-expect */
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { QUERIES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import Profile from "@/pages/profile";
import {
  randomHomeBasedIndustry,
  randomPublicFilingLegalStructure,
  randomTradeNameLegalStructure,
} from "@/test/factories";
import { markdownToText, randomElementFromArray } from "@/test/helpers/helpers-utilities";
import { useMockIntersectionObserver } from "@/test/mock/MockIntersectionObserver";
import * as mockRouter from "@/test/mock/mockRouter";
import { mockRouterEvents, useMockRouter } from "@/test/mock/mockRouter";
import { useMockDocuments } from "@/test/mock/mockUseDocuments";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  chooseTab,
  clickSave,
  fillText,
  generateBusinessForProfile,
  getBusinessProfileInputFieldName,
  getForeignNexusProfileFields,
  renderPage,
  selectByText,
  selectByValue,
} from "@/test/pages/profile/profile-helpers";
import {
  Business,
  BusinessPersona,
  businessPersonas,
  DOL_EIN_CHARACTERS,
  ForeignBusinessTypeId,
  generateBusiness,
  generateMunicipality,
  generateProfileData,
  Industry,
  OperatingPhase,
  OperatingPhases,
  ProfileData,
  randomInt,
} from "@businessnjgovnavigator/shared";
import { generateOwningProfileData, OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import {
  filterRandomIndustry,
  generateFormationData,
  generateTaxFilingData,
} from "@businessnjgovnavigator/shared/test";
import { ProfileTabs } from "@businessnjgovnavigator/shared/types";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";

const Config = getMergedConfig();
const mockApi = api as jest.Mocked<typeof api>;

const goToInfoTab = async (): Promise<void> => {
  await act(async () => {
    chooseTab("info");
  });
  await screen.findByRole("tabpanel", { name: Config.profileDefaults.default.profileTabInfoTitle });
};

const initialFeatureEmployerRatesEnv = process.env.FEATURE_EMPLOYER_RATES;

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      profile_location_question: {
        submit: {
          location_entered_for_first_time: jest.fn(),
        },
      },
    },
  };
}

jest.mock("../../../../shared/lib/content/lib/industry.json", () => ({
  industries: [
    ...jest.requireActual("../../../../shared/lib/content/lib/industry.json").industries,
    {
      id: "test-industry-with-non-essential-questions",
      name: "test-industry-with-non-essential-questions",
      description: "",
      canHavePermanentLocation: true,
      roadmapSteps: [],
      nonEssentialQuestionsIds: ["test-question-1", "test-question-2"],
      naicsCodes: "",
      isEnabled: true,
      industryOnboardingQuestions: {},
    },
    {
      id: "test-industry-with-no-non-essential-questions",
      name: "test-industry-with-no-non-essential-questions",
      description: "",
      canHavePermanentLocation: true,
      roadmapSteps: [],
      nonEssentialQuestionsIds: [],
      naicsCodes: "",
      isEnabled: true,
      industryOnboardingQuestions: {},
    },
  ],
}));

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ postGetAnnualFilings: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;
const nonOwningPersonas: BusinessPersona[] = ["STARTING", "FOREIGN"];

describe("profile - shared", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockRouterEvents.reset();
    useMockRouter({ isReady: true });
    useMockRoadmap({});
    setupStatefulUserDataContext();
    useMockDocuments({});
    useMockIntersectionObserver();
    mockApi.postGetAnnualFilings.mockImplementation((userData) => {
      return Promise.resolve(userData);
    });
  });

  afterEach(() => {
    process.env.FEATURE_EMPLOYER_RATES = initialFeatureEmployerRatesEnv;
  });

  it("shows loading page if page has not loaded yet", () => {
    render(
      <WithStatefulUserData initialUserData={undefined}>
        <Profile municipalities={[]} />
      </WithStatefulUserData>,
    );

    expect(screen.getByText("Loading", { exact: false })).toBeInTheDocument();
    expect(
      screen.queryByText(Config.profileDefaults.default.profileTabInfoTitle),
    ).not.toBeInTheDocument();
  });

  it("shows home-based business question with default description when applicable to industry", () => {
    const defaultDescOperatingPhases = OperatingPhases.filter((phase: OperatingPhase) => {
      return !phase.displayAltHomeBasedBusinessDescription;
    });

    const persona: Partial<ProfileData> = randomElementFromArray([
      { businessPersona: "STARTING" },
      { businessPersona: "OWNING" },
      { businessPersona: "FOREIGN", foreignBusinessTypeIds: ["propertyInNJ"] },
    ]);

    const business = generateBusinessForProfile({
      profileData: generateProfileData({
        industryId: randomHomeBasedIndustry(),
        operatingPhase: randomElementFromArray(defaultDescOperatingPhases as OperatingPhase[]).id,
        ...persona,
      }),
    });

    renderPage({ business });
    chooseTab("permits");

    expect(
      screen.getByText(Config.profileDefaults.fields.homeBasedBusiness.default.description),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.altDescription),
    ).not.toBeInTheDocument();
  });

  it("shows home-based business question with alt description when applicable to industry", () => {
    const altDescOperatingPhases = OperatingPhases.filter((phase: OperatingPhase) => {
      return phase.displayAltHomeBasedBusinessDescription;
    });

    const persona: Partial<ProfileData> = randomElementFromArray([
      { businessPersona: "STARTING" },
      { businessPersona: "OWNING" },
      { businessPersona: "FOREIGN", foreignBusinessTypeIds: ["propertyInNJ"] },
    ]);

    const business = generateBusinessForProfile({
      profileData: generateProfileData({
        industryId: randomHomeBasedIndustry(),
        operatingPhase: randomElementFromArray(altDescOperatingPhases as OperatingPhase[]).id,
        ...persona,
      }),
    });

    renderPage({ business });
    chooseTab("permits");

    expect(
      screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.description),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(Config.profileDefaults.fields.homeBasedBusiness.default.altDescription),
    ).toBeInTheDocument();
  });

  it("should never show the non-essential planned renovation question for owning business, with homebase question as no", () => {
    const business = generateBusinessForProfile({
      profileData: generateOwningProfileData({
        industryId: randomHomeBasedIndustry(),
        operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
        homeBasedBusiness: false,
      }),
    });

    renderPage({ business });

    expect(
      screen.queryByText(
        Config.profileDefaults.fields.plannedRenovationQuestion.default.description,
      ),
    ).not.toBeInTheDocument();
  });

  it.each(nonOwningPersonas)(
    "should show planned renovation question when home base question is no for %s",
    async (businessPersona) => {
      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          industryId: randomHomeBasedIndustry(),
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
          businessPersona: businessPersona,
          homeBasedBusiness: false,
          foreignBusinessTypeIds:
            businessPersona === "FOREIGN" ? ["employeeOrContractorInNJ", "officeInNJ"] : [],
        }),
      });

      renderPage({ business });
      chooseTab("permits");

      expect(
        screen.getByText(
          Config.profileDefaults.fields.plannedRenovationQuestion.default.description,
        ),
      ).toBeInTheDocument();
    },
  );

  it.each(nonOwningPersonas)(
    "should NOT show planned renovation question when home based question is yes for %s",
    async (businessPersona) => {
      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          industryId: randomHomeBasedIndustry(),
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
          businessPersona: businessPersona,
          homeBasedBusiness: true,
          foreignBusinessTypeIds:
            businessPersona === "FOREIGN" ? ["employeeOrContractorInNJ", "officeInNJ"] : [],
        }),
      });

      renderPage({ business });

      expect(
        screen.queryByText(
          Config.profileDefaults.fields.plannedRenovationQuestion.default.description,
        ),
      ).not.toBeInTheDocument();
    },
  );

  it.each(nonOwningPersonas)(
    "should NOT show planned renovation question when home based question is undefined for %s",
    async (businessPersona) => {
      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          industryId: randomHomeBasedIndustry(),
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
          businessPersona: businessPersona,
          homeBasedBusiness: undefined,
          foreignBusinessTypeIds:
            businessPersona === "FOREIGN" ? ["employeeOrContractorInNJ", "officeInNJ"] : [],
        }),
      });

      renderPage({ business });

      expect(
        screen.queryByText(
          Config.profileDefaults.fields.plannedRenovationQuestion.default.description,
        ),
      ).not.toBeInTheDocument();
    },
  );

  it("sends analytics when municipality entered for first time", async () => {
    const persona: Partial<ProfileData> = randomElementFromArray([
      { businessPersona: "STARTING" },
      { businessPersona: "OWNING" },
      { businessPersona: "FOREIGN", foreignBusinessTypeIds: ["officeInNJ"] },
    ]);

    const initialBusiness = generateBusinessForProfile({
      profileData: generateProfileData({
        municipality: undefined,
        ...persona,
      }),
    });

    const randomMunicipality = generateMunicipality({});
    renderPage({ business: initialBusiness, municipalities: [randomMunicipality] });
    await goToInfoTab();
    selectByText("Location", randomMunicipality.displayName);
    expect(screen.getByLabelText("Location")).toHaveValue(randomMunicipality.displayName);
    fireEvent.blur(screen.getByLabelText("Location"));
    clickSave();
    await waitFor(() => {
      return expect(currentBusiness().profileData.municipality).toEqual(randomMunicipality);
    });
    expect(
      mockAnalytics.event.profile_location_question.submit.location_entered_for_first_time,
    ).toHaveBeenCalled();
  });

  it("does not send analytics when municipality already existed", async () => {
    const randomMunicipality = generateMunicipality({});

    const persona: Partial<ProfileData> = randomElementFromArray([
      { businessPersona: "STARTING" },
      { businessPersona: "OWNING" },
      { businessPersona: "FOREIGN", foreignBusinessTypeIds: ["officeInNJ"] },
    ]);

    const initialBusiness = generateBusinessForProfile({
      profileData: generateProfileData({
        municipality: generateMunicipality({ displayName: "Some Display Name" }),
        ...persona,
      }),
    });

    renderPage({ business: initialBusiness, municipalities: [randomMunicipality] });
    await goToInfoTab();
    selectByText("Location", randomMunicipality.displayName);
    clickSave();
    await waitFor(() => {
      return expect(currentBusiness().profileData.municipality).toEqual(randomMunicipality);
    });
    expect(
      mockAnalytics.event.profile_location_question.submit.location_entered_for_first_time,
    ).not.toHaveBeenCalled();
  });

  describe("escape modal unsaved changes guard", () => {
    const makeBusiness = (): Business => {
      return generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
        }),
      });
    };

    it("does not show escape modal when saving changes", async () => {
      const initialIndustry = filterRandomIndustry(() => true);
      const updatedIndustry = filterRandomIndustry(
        (industry: Industry) => industry.id !== initialIndustry.id,
      );

      mockRouter.mockPush.mockImplementation(async (url: string) => {
        try {
          mockRouterEvents.emit("routeChangeStart", url);
        } catch {
          // expected when navigation is blocked
        }
        return {};
      });

      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          industryId: initialIndustry.id,
        }),
      });

      renderPage({ business });

      selectByText("Industry", updatedIndustry.name);
      clickSave();

      await waitFor(() => {
        expect(mockRouter.mockPush).toHaveBeenCalledWith("/dashboard?success=true");
      });

      expect(
        screen.queryByText(Config.profileDefaults.default.escapeModalReturn),
      ).not.toBeInTheDocument();
    });

    it("shows escape modal when navigation is intercepted by unsaved changes guard", async () => {
      const business = makeBusiness();
      renderPage({ business });
      await goToInfoTab();
      const inputFieldName = getBusinessProfileInputFieldName(business);
      fillText(inputFieldName, "Some New Business Name");

      await act(async () => {
        try {
          mockRouterEvents.emit("routeChangeStart", "/dashboard");
        } catch {
          // expected
        }
      });

      expect(
        await screen.findByText(Config.profileDefaults.default.escapeModalReturn),
      ).toBeInTheDocument();
    });

    it("saves and redirects to the pending url after unsaved changes interception", async () => {
      const business = makeBusiness();
      renderPage({ business });
      await goToInfoTab();
      const inputFieldName = getBusinessProfileInputFieldName(business);
      fillText(inputFieldName, "Some New Business Name");

      await act(async () => {
        try {
          mockRouterEvents.emit("routeChangeStart", "/dashboard");
        } catch {
          // expected
        }
      });

      fireEvent.click(
        await screen.findByRole("button", {
          name: Config.profileDefaults.default.escapeModalSaveChanges,
        }),
      );
      await waitFor(() => {
        expect(mockRouter.mockPush).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("leaves without saving when secondary modal button is clicked", async () => {
      const business = makeBusiness();
      renderPage({ business });
      await goToInfoTab();
      const inputFieldName = getBusinessProfileInputFieldName(business);
      fillText(inputFieldName, "Another Business Name");

      await act(async () => {
        try {
          mockRouterEvents.emit("routeChangeStart", "/dashboard");
        } catch {
          // expected
        }
      });

      fireEvent.click(
        await screen.findByRole("button", {
          name: Config.profileDefaults.default.escapeModalReturn,
        }),
      );
      await waitFor(() => {
        expect(mockRouter.mockPush).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("keeps editing when tertiary modal button is clicked", async () => {
      const business = makeBusiness();
      renderPage({ business });
      await goToInfoTab();
      const inputFieldName = getBusinessProfileInputFieldName(business);
      fillText(inputFieldName, "Yet Another Business Name");

      await act(async () => {
        try {
          mockRouterEvents.emit("routeChangeStart", "/dashboard");
        } catch {
          // expected
        }
      });

      fireEvent.click(
        await screen.findByRole("button", {
          name: Config.profileDefaults.default.escapeModalEscape,
        }),
      );
      await waitFor(() =>
        expect(
          screen.queryByText(Config.profileDefaults.default.escapeModalReturn),
        ).not.toBeInTheDocument(),
      );
      expect(mockRouter.mockPush).not.toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("Numbers Section", () => {
    describe("tax id", () => {
      describe("disabled", () => {
        businessPersonas.map((businessPersona) => {
          it(`disables taxId for ${businessPersona} businessPersona when taxFiling Status is SUCCESS or PENDING`, () => {
            const business = generateBusinessForProfile({
              profileData: generateProfileData({
                taxId: "*******89123",
                encryptedTaxId: "some-encrypted-value",
                businessPersona,
                foreignBusinessTypeIds: businessPersona === "FOREIGN" ? ["none"] : [],
              }),
              taxFilingData: generateTaxFilingData({
                state: randomInt() % 2 ? "SUCCESS" : "PENDING",
              }),
            });

            renderPage({ business });
            chooseTab("numbers");
            expect(screen.queryByLabelText("Tax id")).not.toBeInTheDocument();
            expect(screen.getByTestId("disabled-tax-id-value")).toHaveTextContent("****-****-****");
            expect(screen.queryByTestId("tax-disclaimer")).not.toBeInTheDocument();
          });
        });
      });

      describe("disclaimer", () => {
        businessPersonas.map((businessPersona) => {
          const foreignBusinessTypeIds: ForeignBusinessTypeId[] = [];
          if (businessPersona === "FOREIGN")
            foreignBusinessTypeIds.push("employeeOrContractorInNJ", "officeInNJ");
          foreignBusinessTypeIds.map((foreignBusinessTypeId) => {
            it(`shows disclaimer for trade name legal structure for ${businessPersona} ${
              foreignBusinessTypeId ?? ""
            } businessPersona`, () => {
              const business = generateBusinessForProfile({
                profileData: generateProfileData({
                  legalStructureId: randomTradeNameLegalStructure(),
                  businessPersona: businessPersona,
                  foreignBusinessTypeIds: [foreignBusinessTypeId],
                }),
              });
              renderPage({ business });
              chooseTab("numbers");
              expect(screen.getByTestId("tax-disclaimer")).toHaveTextContent(
                markdownToText(Config.profileDefaults.fields.taxId.default.disclaimerMd),
              );
            });
          });
        });

        it("does not show disclaimer for public filing legal structure", () => {
          const business = generateBusinessForProfile({
            profileData: generateProfileData({
              legalStructureId: randomPublicFilingLegalStructure(),
            }),
          });
          renderPage({ business });
          chooseTab("numbers");

          expect(screen.queryByTestId("tax-disclaimer")).not.toBeInTheDocument();
        });
      });
    });

    describe("tax pin", () => {
      it.each(["STARTING", "OWNING"])(
        "displays the tax pin field for %s businessPersona",
        (businessPersona) => {
          renderPage({
            business: generateBusinessForProfile({
              profileData: generateProfileData({
                businessPersona: businessPersona as BusinessPersona,
              }),
            }),
          });
          chooseTab("numbers");
          expect(
            screen.getByText(Config.profileDefaults.fields.taxPin.default.header),
          ).toBeInTheDocument();
        },
      );
    });
  });

  describe("Callout that the profile helps with recommendations", () => {
    it.each(businessPersonas)(
      "shows the callout for all personas when unauthenticated for %s",
      (persona) => {
        const business = generateBusinessForProfile({
          formationData: generateFormationData({
            completedFilingPayment: false,
          }),
          profileData: generateProfileData({
            dateOfFormation: undefined,
            businessPersona: persona,
          }),
        });
        renderPage({ business, isAuthenticated: IsAuthenticated.FALSE });

        const calloutText =
          Config.profileDefaults.default.yourProfileHelpsWithRecommendationsCallout.match(
            /}\s*\*{2}([^*]+)\*{2}\s*:::/,
          )?.[1];

        expect(calloutText).toBeDefined();
        expect(screen.getByText(calloutText!)).toBeInTheDocument();
      },
    );

    it("shows the callout for OWNING businesses and authenticated", () => {
      const business = generateBusinessForProfile({
        formationData: generateFormationData({
          completedFilingPayment: true,
        }),
        profileData: generateOwningProfileData({
          dateOfFormation: undefined,
        }),
      });
      renderPage({ business, isAuthenticated: IsAuthenticated.TRUE });

      const calloutText =
        Config.profileDefaults.default.yourProfileHelpsWithRecommendationsCallout.match(
          /}\s*\*{2}([^*]+)\*{2}\s*:::/,
        )?.[1];

      expect(calloutText).toBeDefined();
      expect(screen.getByText(calloutText!)).toBeInTheDocument();
    });

    it.each(nonOwningPersonas)(
      "shows the callout for %s business that paid via the Navigator and are authenticated",
      (persona) => {
        const business = generateBusinessForProfile({
          formationData: generateFormationData({
            completedFilingPayment: true,
          }),
          profileData: generateProfileData({
            dateOfFormation: "2020-8-8",
            businessPersona: persona as BusinessPersona,
          }),
        });
        renderPage({ business, isAuthenticated: IsAuthenticated.TRUE });

        const calloutText =
          Config.profileDefaults.default.yourProfileHelpsWithRecommendationsCallout.match(
            /}\s*\*{2}([^*]+)\*{2}\s*:::/,
          )?.[1];

        expect(calloutText).toBeDefined();
        expect(screen.getByText(calloutText!)).toBeInTheDocument();
      },
    );

    it.each(nonOwningPersonas)(
      "shows the callout for %s business that have not paid and not formed and are authenticated",
      (persona) => {
        const business = generateBusinessForProfile({
          formationData: generateFormationData({
            completedFilingPayment: false,
          }),
          profileData: generateProfileData({
            dateOfFormation: undefined,
            businessPersona: persona as BusinessPersona,
          }),
        });
        renderPage({ business, isAuthenticated: IsAuthenticated.TRUE });

        const calloutText =
          Config.profileDefaults.default.yourProfileHelpsWithRecommendationsCallout.match(
            /}\s*\*{2}([^*]+)\*{2}\s*:::/,
          )?.[1];

        expect(calloutText).toBeDefined();
        expect(screen.getByText(calloutText!)).toBeInTheDocument();
      },
    );

    it.each(businessPersonas)(
      "shows the callout for %s business that set DateOfFormation but did NOT pay",
      (persona) => {
        const business = generateBusinessForProfile({
          formationData: generateFormationData({
            completedFilingPayment: false,
          }),
          profileData: generateProfileData({
            dateOfFormation: "2020-8-8",
            businessPersona: persona as BusinessPersona,
          }),
        });
        renderPage({ business, isAuthenticated: IsAuthenticated.TRUE });

        const calloutText =
          Config.profileDefaults.default.yourProfileHelpsWithRecommendationsCallout.match(
            /}\s*\*{2}([^*]+)\*{2}\s*:::/,
          )?.[1];

        expect(calloutText).toBeDefined();
        expect(screen.getByText(calloutText!)).toBeInTheDocument();
      },
    );
  });

  describe("non essential questions", () => {
    const generateBusinessForNonEssentialQuestionTest = (
      profileData: Partial<ProfileData>,
    ): Business => {
      return generateBusiness({
        profileData: generateProfileData({
          ...profileData,
          foreignBusinessTypeIds:
            profileData.businessPersona === "FOREIGN" ? ["employeeOrContractorInNJ"] : [],
        }),
      });
    };

    it.each(nonOwningPersonas)(
      "resets non essential questions if industry is changed when %s",
      async (businessPersona: BusinessPersona) => {
        const business = generateBusinessForNonEssentialQuestionTest({
          industryId: "test-industry-with-non-essential-questions",
          businessPersona: businessPersona,
          nonEssentialRadioAnswers: {
            "test-question-1": true,
            "test-question-2": true,
          },
        });
        renderPage({ business });
        await goToInfoTab();
        selectByValue("Industry", "test-industry-with-no-non-essential-questions");
        clickSave();
        await waitFor(() => {
          expect(currentBusiness().profileData.nonEssentialRadioAnswers).toStrictEqual({});
        });
      },
    );
  });

  describe("location", () => {
    it.each(nonOwningPersonas)(
      "displays a warning alert for cannabis businesses when %s",
      async (businessPersona: BusinessPersona) => {
        renderPage({
          business: generateBusinessForProfile({
            profileData: generateProfileData({
              businessPersona: businessPersona,
              municipality: generateMunicipality({ displayName: "Trenton" }),
              industryId: "cannabis",
              ...getForeignNexusProfileFields(businessPersona),
            }),
          }),
        });
        await goToInfoTab();
        expect(
          screen.getByText(Config.profileDefaults.default.cannabisLocationAlert),
        ).toBeInTheDocument();
      },
    );

    it.each(nonOwningPersonas)(
      "should NOT display a warning alert for non-cannabis businesses when %s",
      async (businessPersona: BusinessPersona) => {
        const filter = (industry: Industry): boolean => industry.id !== "cannabis";
        const industry = filterRandomIndustry(filter);

        renderPage({
          business: generateBusinessForProfile({
            profileData: generateProfileData({
              businessPersona: businessPersona,
              industryId: industry.id,
              ...getForeignNexusProfileFields(businessPersona),
            }),
          }),
        });
        await goToInfoTab();
        expect(
          screen.queryByText(Config.profileDefaults.default.cannabisLocationAlert),
        ).not.toBeInTheDocument();
      },
    );

    it("should NOT display a cannabis specific warning alert when OWNING", () => {
      renderPage({
        business: generateBusinessForProfile({
          profileData: generateOwningProfileData({}),
        }),
      });
      expect(
        screen.queryByText(Config.profileDefaults.default.cannabisLocationAlert),
      ).not.toBeInTheDocument();
    });
  });

  describe("profile error alert", () => {
    it.each(nonOwningPersonas)(
      "displays alert with the header if industry field has an error when %s",
      async (businessPersona) => {
        const business = generateBusinessForProfile({
          profileData: generateProfileData({
            businessPersona: businessPersona as BusinessPersona,
            industryId: undefined,
            foreignBusinessTypeIds:
              businessPersona === "FOREIGN" ? ["employeeOrContractorInNJ", "officeInNJ"] : [],
          }),
        });
        renderPage({ business });
        await goToInfoTab();
        clickSave();
        const profileAlert = screen.getByTestId("profile-error-alert");
        await waitFor(() => {
          expect(profileAlert).toBeInTheDocument();
        });
        expect(
          within(profileAlert).getByText(Config.profileDefaults.fields.industryId.default.header),
        ).toBeInTheDocument();
      },
    );
  });

  describe("sets init profile tab", () => {
    it("should use the default tab when no query param is set", () => {
      const business = generateBusinessForProfile({});

      renderPage({ business });

      expect(
        screen.getByRole("tabpanel", { name: Config.profileDefaults.default.profileTabInfoTitle }),
      ).toBeInTheDocument();
    });

    it("should use the default tab when query param is set to an invalid tab value", () => {
      window.history.replaceState({}, "", "/profile?tab=invalid-value");
      useMockRouter({
        isReady: true,
        pathname: "/profile",
        query: { [QUERIES.tab]: "invalid-value" },
      });

      const business = generateBusinessForProfile({});

      renderPage({ business });

      expect(
        screen.getByRole("tabpanel", { name: Config.profileDefaults.default.profileTabInfoTitle }),
      ).toBeInTheDocument();
    });

    it("should be set to the query param tab when query param is set", () => {
      window.history.replaceState({}, "", "/profile?tab=notes");
      useMockRouter({
        isReady: true,
        pathname: "/profile",
        query: { [QUERIES.tab]: "notes" },
      });

      const business = generateBusinessForProfile({});

      renderPage({ business });

      expect(
        screen.queryByRole("tabpanel", {
          name: Config.profileDefaults.default.profileTabInfoTitle,
        }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("tabpanel", {
          name: Config.profileDefaults.default.profileTabNoteTitle,
        }),
      ).toBeInTheDocument();
    });
  });

  describe("tab query param syncing", () => {
    beforeEach(() => {
      // Clear any existing URL state - ensure no query params
      window.history.replaceState({}, "", "/profile");
      // Reset router to ensure clean state
      useMockRouter({ isReady: true, query: {} });
    });

    it("navigates to the correct slug for all tabs defined in Config", async () => {
      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          industryId: randomHomeBasedIndustry(),
          legalStructureId: randomPublicFilingLegalStructure(),
        }),
      });
      renderPage({ business });

      const profileTabSlugs = (
        Config.profileDefaults.default as { profileTabSlugs: Record<string, string> }
      ).profileTabSlugs;

      for (const tab of Object.keys(profileTabSlugs) as ProfileTabs[]) {
        const expectedSlug = profileTabSlugs[tab];
        expect(expectedSlug).toBeDefined();

        await act(async () => {
          chooseTab(tab);
        });

        await waitFor(() => {
          expect(window.location.search).toContain(`?${QUERIES.tab}=${expectedSlug}`);
        });
      }
    });
  });

  describe("personalize your tasks tab", () => {
    beforeEach(() => {
      jest.resetModules();
      const originalEnvironment = process.env;
      process.env = {
        ...originalEnvironment,
      };
    });

    it("navigates correctly to the personalize your tasks tab", () => {
      const business = generateBusinessForProfile({});

      renderPage({ business });

      expect(
        screen.getByRole("tab", {
          name: Config.profileDefaults.default.profileTabPersonalizeYourTasksTitle,
        }),
      ).toBeInTheDocument();
    });
  });

  describe("employer rates section", () => {
    it("saves employerAccessRegistration when save button is clicked", async () => {
      process.env.FEATURE_EMPLOYER_RATES = "true";

      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
          businessPersona: "OWNING",
          employerAccessRegistration: undefined,
        }),
      });

      renderPage({ business });
      chooseTab("numbers");
      const employerRatesSection = screen.getByTestId("employerAccess");
      await userEvent.click(
        within(employerRatesSection).getByRole("radio", {
          name: Config.employerRates.employerAccessTrueText,
        }),
      );

      clickSave();
      await waitFor(() => {
        expect(currentBusiness().profileData.employerAccessRegistration).toEqual(true);
      });
    });

    it("updates DOL EIN, presses save, and persists to UserData", async () => {
      process.env.FEATURE_EMPLOYER_RATES = "true";

      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
          businessPersona: "OWNING",
          employerAccessRegistration: true,
          deptOfLaborEin: "",
        }),
      });

      renderPage({ business });
      chooseTab("numbers");

      const employerRatesSection = screen.getByTestId("employerAccess");
      const textbox = within(employerRatesSection).getByRole("textbox");
      const newEin = "1".repeat(DOL_EIN_CHARACTERS);
      await userEvent.type(textbox, newEin);

      clickSave();
      await waitFor(() => {
        expect(currentBusiness().profileData.deptOfLaborEin).toEqual(newEin);
      });
    });

    it("prevents saving DOL EIN if the number of characters is incorrect", async () => {
      process.env.FEATURE_EMPLOYER_RATES = "true";

      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
          businessPersona: "OWNING",
          employerAccessRegistration: true,
          deptOfLaborEin: "",
        }),
      });

      renderPage({ business });
      chooseTab("numbers");

      const employerRatesSection = screen.getByTestId("employerAccess");
      const textbox = within(employerRatesSection).getByRole("textbox");
      const newEin = "123";
      await userEvent.type(textbox, newEin);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Save" }));
      expect(screen.getAllByRole("alert").length).toBe(2);
    });

    it("allows save if DOL EIN is the correct number of characters", async () => {
      process.env.FEATURE_EMPLOYER_RATES = "true";

      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
          businessPersona: "OWNING",
          employerAccessRegistration: true,
          deptOfLaborEin: "",
        }),
      });

      renderPage({ business });
      chooseTab("numbers");

      const employerRatesSection = screen.getByTestId("employerAccess");
      const textbox = within(employerRatesSection).getByRole("textbox");
      const newEin = "1".repeat(DOL_EIN_CHARACTERS);
      await userEvent.type(textbox, newEin);

      await userEvent.click(screen.getByRole("button", { name: "Save" }));
      expect(screen.getByTestId("snackbar-alert-SUCCESS")).toBeInTheDocument();
    });

    it("allows save if DOL EIN is incorrect number of characters but user changes employer access radio", async () => {
      process.env.FEATURE_EMPLOYER_RATES = "true";

      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
          businessPersona: "OWNING",
          employerAccessRegistration: true,
          deptOfLaborEin: "",
        }),
      });

      renderPage({ business });
      chooseTab("numbers");

      const employerRatesSection = screen.getByTestId("employerAccess");
      const textbox = within(employerRatesSection).getByRole("textbox");
      const newEin = "1".repeat(10);
      await userEvent.type(textbox, newEin);
      await userEvent.tab();

      expect(screen.getAllByRole("alert").length).toBe(2);

      await userEvent.click(
        within(employerRatesSection).getByRole("radio", {
          name: Config.employerRates.employerAccessFalseText,
        }),
      );
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Save" }));
      expect(screen.getByTestId("snackbar-alert-SUCCESS")).toBeInTheDocument();
    });
  });
});
