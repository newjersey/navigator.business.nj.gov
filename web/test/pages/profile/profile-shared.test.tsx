/* eslint-disable jest/expect-expect */
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import analytics from "@/lib/utils/analytics";
import Profile from "@/pages/profile";
import {
  randomHomeBasedIndustry,
  randomPublicFilingLegalStructure,
  randomTradeNameLegalStructure,
} from "@/test/factories";
import { markdownToText, randomElementFromArray } from "@/test/helpers/helpers-utilities";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockDocuments } from "@/test/mock/mockUseDocuments";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  WithStatefulUserData,
  currentBusiness,
  setupStatefulUserDataContext,
} from "@/test/mock/withStatefulUserData";
import {
  Business,
  BusinessPersona,
  ForeignBusinessTypeId,
  Industry,
  OperatingPhase,
  OperatingPhases,
  ProfileData,
  businessPersonas,
  emptyProfileData,
  generateBusiness,
  generateMunicipality,
  generateProfileData,
  randomInt,
} from "@businessnjgovnavigator/shared";
import {
  generateFormationData,
  generateTaxFilingData,
  randomFilteredIndustry,
} from "@businessnjgovnavigator/shared/test";

import { IsAuthenticated } from "@/lib/auth/AuthContext";
import {
  chooseTab,
  clickSave,
  fillText,
  generateBusinessForProfile,
  getForeignNexusProfileFields,
  phasesWhereGoToProfileDoesNotShow,
  phasesWhereGoToProfileShows,
  renderPage,
  selectByText,
  selectByValue,
} from "@/test/pages/profile/profile-helpers";
import { render, screen, waitFor, within } from "@testing-library/react";

const Config = getMergedConfig();
const mockApi = api as jest.Mocked<typeof api>;

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

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
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
    useMockRouter({});
    useMockRoadmap({});
    setupStatefulUserDataContext();
    useMockDocuments({});
    mockApi.postGetAnnualFilings.mockImplementation((userData) => {
      return Promise.resolve(userData);
    });
  });

  it("shows loading page if page has not loaded yet", () => {
    render(
      <WithStatefulUserData initialUserData={undefined}>
        <Profile municipalities={[]} />
      </WithStatefulUserData>
    );

    expect(screen.getByText("Loading", { exact: false })).toBeInTheDocument();
    expect(screen.queryByText(Config.profileDefaults.default.pageTitle)).not.toBeInTheDocument();
  });

  it("shows home-based business question with default description when applicable to industry", () => {
    const defaultDescOperatingPhases = OperatingPhases.filter((phase: OperatingPhase) => {
      return !phase.displayAltHomeBasedBusinessDescription;
    });

    const business = generateBusinessForProfile({
      profileData: generateProfileData({
        industryId: randomHomeBasedIndustry(),
        operatingPhase: randomElementFromArray(defaultDescOperatingPhases as OperatingPhase[]).id,
        nexusLocationInNewJersey: false,
      }),
    });

    renderPage({ business });

    expect(
      screen.getByText(Config.profileDefaults.fields.homeBasedBusiness.default.description)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.altDescription)
    ).not.toBeInTheDocument();
  });

  it("shows home-based business question with alt description when applicable to industry", () => {
    const altDescOperatingPhases = OperatingPhases.filter((phase: OperatingPhase) => {
      return phase.displayAltHomeBasedBusinessDescription;
    });
    const business = generateBusinessForProfile({
      profileData: generateProfileData({
        industryId: randomHomeBasedIndustry(),
        operatingPhase: randomElementFromArray(altDescOperatingPhases as OperatingPhase[]).id,
        nexusLocationInNewJersey: false,
      }),
    });

    renderPage({ business });

    expect(
      screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.description)
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(Config.profileDefaults.fields.homeBasedBusiness.default.altDescription)
    ).toBeInTheDocument();
  });

  it("sends analytics when municipality entered for first time", async () => {
    const initialBusiness = generateBusinessForProfile({
      profileData: generateProfileData({
        municipality: undefined,
      }),
    });

    const newark = generateMunicipality({ displayName: "Newark" });
    renderPage({ business: initialBusiness, municipalities: [newark] });
    selectByText("Location", newark.displayName);
    clickSave();
    await waitFor(() => {
      return expect(currentBusiness().profileData.municipality).toEqual(newark);
    });
    expect(
      mockAnalytics.event.profile_location_question.submit.location_entered_for_first_time
    ).toHaveBeenCalled();
  });

  it("does not send analytics when municipality already existed", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });

    const initialBusiness = generateBusinessForProfile({
      profileData: generateProfileData({
        municipality: generateMunicipality({ displayName: "Jersey City" }),
      }),
    });

    renderPage({ business: initialBusiness, municipalities: [newark] });
    selectByText("Location", newark.displayName);
    clickSave();
    await waitFor(() => {
      return expect(currentBusiness().profileData.municipality).toEqual(newark);
    });
    expect(
      mockAnalytics.event.profile_location_question.submit.location_entered_for_first_time
    ).not.toHaveBeenCalled();
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
              taxFilingData: generateTaxFilingData({ state: randomInt() % 2 ? "SUCCESS" : "PENDING" }),
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
          if (businessPersona === "FOREIGN") foreignBusinessTypeIds.push("employeeOrContractorInNJ");
          foreignBusinessTypeIds.map((foreignBusinessTypeId) => {
            it(`shows disclaimer for trade name legal structure for ${businessPersona} ${
              foreignBusinessTypeId ?? ""
            } businessPersona`, () => {
              const business = generateBusinessForProfile({
                profileData: generateProfileData({
                  legalStructureId: randomTradeNameLegalStructure(),
                  businessPersona: businessPersona,
                  nexusLocationInNewJersey: true,
                  foreignBusinessTypeIds: [foreignBusinessTypeId],
                }),
              });
              renderPage({ business });
              chooseTab("numbers");
              expect(screen.getByTestId("tax-disclaimer")).toHaveTextContent(
                markdownToText(Config.profileDefaults.fields.taxId.default.disclaimerMd)
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
  });

  describe("profile opportunities alert", () => {
    it.each(phasesWhereGoToProfileShows)("displays alert for %s", (operatingPhase) => {
      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          operatingPhase,
          dateOfFormation: undefined,
        }),
      });
      renderPage({ business });

      expect(screen.getByTestId("opp-alert")).toBeInTheDocument();
    });

    it.each(phasesWhereGoToProfileDoesNotShow)("does not display alert for %s", (operatingPhase) => {
      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          operatingPhase,
          dateOfFormation: undefined,
        }),
      });
      renderPage({ business });

      expect(screen.queryByTestId("opp-alert")).not.toBeInTheDocument();
    });

    it("does display date of formation question when legal structure is undefined", () => {
      const business = generateBusinessForProfile({
        profileData: {
          ...emptyProfileData,
          operatingPhase: "UP_AND_RUNNING_OWNING",
          businessPersona: "OWNING",
        },
      });
      renderPage({ business });
      expect(
        within(screen.getByTestId("opp-alert")).getByText(
          Config.profileDefaults.fields.dateOfFormation.default.header
        )
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId("effective-date")).getByText(
          Config.profileDefaults.fields.dateOfFormation.default.header
        )
      ).toBeInTheDocument();
    });

    it("does not display date of formation question when it is a Trade Name legal structure", () => {
      const business = generateBusinessForProfile({
        profileData: {
          ...emptyProfileData,
          operatingPhase: "UP_AND_RUNNING_OWNING",
          businessPersona: "OWNING",
          legalStructureId: randomTradeNameLegalStructure(),
        },
      });
      renderPage({ business });
      expect(
        screen.queryByText(Config.profileDefaults.fields.dateOfFormation.default.header)
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("effective-date")).not.toBeInTheDocument();
    });

    it("does display date of formation question when it is a not a Trade Name legal structure", () => {
      const business = generateBusinessForProfile({
        profileData: {
          ...emptyProfileData,
          operatingPhase: "UP_AND_RUNNING_OWNING",
          businessPersona: "OWNING",
          legalStructureId: randomPublicFilingLegalStructure(),
        },
      });
      renderPage({ business });
      expect(
        within(screen.getByTestId("opp-alert")).getByText(
          Config.profileDefaults.fields.dateOfFormation.default.header
        )
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId("effective-date")).getByText(
          Config.profileDefaults.fields.dateOfFormation.default.header
        )
      ).toBeInTheDocument();
    });

    it("removes question from alert when it gets answered", () => {
      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          operatingPhase: "UP_AND_RUNNING_OWNING",
          dateOfFormation: undefined,
          existingEmployees: undefined,
          legalStructureId: randomPublicFilingLegalStructure(),
        }),
      });
      renderPage({ business });

      expect(screen.getByTestId("opp-alert")).toHaveTextContent(
        Config.profileDefaults.fields.dateOfFormation.default.header
      );
      expect(screen.getByTestId("opp-alert")).toHaveTextContent(
        Config.profileDefaults.fields.existingEmployees.overrides.OWNING.header
      );

      fillText("Existing employees", "12");

      expect(screen.getByTestId("opp-alert")).toHaveTextContent(
        Config.profileDefaults.fields.dateOfFormation.default.header
      );
      expect(screen.getByTestId("opp-alert")).not.toHaveTextContent(
        Config.profileDefaults.fields.existingEmployees.overrides.OWNING.header
      );
    });
  });

  describe("Special Note Alert for Businesses Formed outside the Navigator", () => {
    it.each(businessPersonas)("shows the Note Alert for all personas when unauthenticated", (persona) => {
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
      expect(
        screen.getByText(Config.profileDefaults.default.noteForBusinessesFormedOutsideNavigator)
      ).toBeInTheDocument();
    });

    it("shows the Note Alert for OWNING businesses and authenticated", () => {
      const business = generateBusinessForProfile({
        formationData: generateFormationData({
          completedFilingPayment: true,
        }),
        profileData: generateProfileData({
          dateOfFormation: undefined,
          businessPersona: "OWNING",
        }),
      });
      renderPage({ business, isAuthenticated: IsAuthenticated.TRUE });
      expect(
        screen.getByText(Config.profileDefaults.default.noteForBusinessesFormedOutsideNavigator)
      ).toBeInTheDocument();
    });

    it.each(nonOwningPersonas)(
      "does NOT show Note Alert for %s business that paid via the Navigator and are authenticated",
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
        expect(
          screen.queryByText(Config.profileDefaults.default.noteForBusinessesFormedOutsideNavigator)
        ).not.toBeInTheDocument();
      }
    );

    it.each(nonOwningPersonas)(
      "does NOT show Note Alert for %s business that have not paid and not formed and are authenticated",
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
        expect(
          screen.queryByText(Config.profileDefaults.default.noteForBusinessesFormedOutsideNavigator)
        ).not.toBeInTheDocument();
      }
    );

    it.each(businessPersonas)(
      "shows Note alert for %s business that set DateOfFormation but did NOT pay",
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
        expect(
          screen.getByText(Config.profileDefaults.default.noteForBusinessesFormedOutsideNavigator)
        ).toBeInTheDocument();
      }
    );
  });

  describe("non essential questions", () => {
    const generateBusinessForNonEssentialQuestionTest = (profileData: Partial<ProfileData>): Business => {
      return generateBusiness({
        profileData: generateProfileData({
          ...profileData,
          nexusLocationInNewJersey: profileData.businessPersona === "FOREIGN" ? false : undefined,
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
        selectByValue("Industry", "test-industry-with-no-non-essential-questions");
        clickSave();
        await waitFor(() => {
          expect(currentBusiness().profileData.nonEssentialRadioAnswers).toStrictEqual({});
        });
      }
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
        expect(screen.getByText(Config.profileDefaults.default.cannabisLocationAlert)).toBeInTheDocument();
      }
    );

    it.each(nonOwningPersonas)(
      "should NOT display a warning alert for non-cannabis businesses when %s",
      async (businessPersona: BusinessPersona) => {
        const filter = (industry: Industry): boolean => industry.id !== "cannabis";
        const industry = randomFilteredIndustry(filter, { isEnabled: true });

        renderPage({
          business: generateBusinessForProfile({
            profileData: generateProfileData({
              businessPersona: businessPersona,
              municipality: generateMunicipality({ displayName: "Trenton" }),
              industryId: industry.id,
              ...getForeignNexusProfileFields(businessPersona),
            }),
          }),
        });
        expect(
          screen.queryByText(Config.profileDefaults.default.cannabisLocationAlert)
        ).not.toBeInTheDocument();
      }
    );

    it("should NOT display a cannabis specific warning alert when OWNING", () => {
      renderPage({
        business: generateBusinessForProfile({
          profileData: generateProfileData({
            businessPersona: "OWNING",
          }),
        }),
      });
      expect(
        screen.queryByText(Config.profileDefaults.default.cannabisLocationAlert)
      ).not.toBeInTheDocument();
    });
  });

  describe("profile error alert", () => {
    it.each(["STARTING", "FOREIGN"])(
      "displays alert with the header if industry field has an error when %s",
      async (businessPersona) => {
        const business = generateBusinessForProfile({
          profileData: generateProfileData({
            businessPersona: businessPersona as BusinessPersona,
            industryId: undefined,
            nexusLocationInNewJersey: businessPersona === "FOREIGN" ? false : undefined,
            foreignBusinessTypeIds: businessPersona === "FOREIGN" ? ["employeeOrContractorInNJ"] : [],
          }),
        });
        renderPage({ business });
        clickSave();
        const profileAlert = screen.getByTestId("profile-error-alert");
        await waitFor(() => {
          expect(profileAlert).toBeInTheDocument();
        });
        expect(
          within(profileAlert).getByText(Config.profileDefaults.fields.industryId.default.header)
        ).toBeInTheDocument();
      }
    );
  });
});
