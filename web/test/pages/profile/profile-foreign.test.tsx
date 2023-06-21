/* eslint-disable jest/expect-expect */
import { getMergedConfig } from "@/contexts/configContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { allLegalStructuresOfType, randomHomeBasedIndustry } from "@/test/factories";
import { markdownToText } from "@/test/helpers/helpers-utilities";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { setupStatefulUserDataContext } from "@/test/mock/withStatefulUserData";
import {
  defaultDateFormat,
  emptyIndustrySpecificData,
  FormationData,
  generateMunicipality,
  generateProfileData,
  getCurrentDateFormatted,
  LookupLegalStructureById,
  OperatingPhaseId,
  ProfileData,
  TaxFilingData,
  UserData,
} from "@businessnjgovnavigator/shared/index";
import {
  generateFormationData,
  generateTaxFilingData,
  randomLegalStructure,
} from "@businessnjgovnavigator/shared/test";

import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { industryIdsWithRequiredEssentialQuestion } from "@/test/pages/onboarding/helpers-onboarding";
import {
  clickBack,
  clickSave,
  expectLocationNotSavedAndError,
  expectLocationSavedAsUndefined,
  generateUserData,
  removeLocationAndSave,
  renderPage,
} from "@/test/pages/profile/profile-helpers";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";

const Config = getMergedConfig();

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ postGetAnnualFilings: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("profile-foreign", () => {
  let userData: UserData;

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockRoadmap({});
    setupStatefulUserDataContext();
    userData = generateUserData({
      profileData: generateProfileData({ businessPersona: "FOREIGN" }),
    });
  });

  it("sends user back to dashboard", async () => {
    renderPage({ userData: userData });
    clickBack();
    await waitFor(() => {
      return expect(mockRouter.mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
    });
  });

  it("does not display the documents tab", () => {
    renderPage({ userData: userData });
    expect(screen.getAllByText(Config.profileDefaults.profileTabRefTitle).length).toBeGreaterThan(0);
    expect(screen.getAllByText(Config.profileDefaults.profileTabNoteTitle).length).toBeGreaterThan(0);
    expect(screen.getAllByText(Config.profileDefaults.profileTabInfoTitle).length).toBeGreaterThan(0);
    expect(screen.queryByText(Config.profileDefaults.profileTabDocsTitle)).not.toBeInTheDocument();
  });

  it("does not show the home-based question if locationInNewJersey=true, even if industry applicable", () => {
    renderPage({
      userData: generateUserData({
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessType: "NEXUS",
          nexusLocationInNewJersey: true,
          industryId: randomHomeBasedIndustry(),
        }),
      }),
    });
    expect(screen.queryByText("Home-based business")).not.toBeInTheDocument();
  });

  it.each(industryIdsWithRequiredEssentialQuestion)(
    "prevents Foreign Nexus user from saving when %s is selected as industry, but essential question is not answered",
    async (industryId) => {
      const userData = generateUserData({
        onboardingFormProgress: "UNSTARTED",
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessType: "NEXUS",
          industryId: industryId,
          foreignBusinessTypeIds: ["NEXUS"],
          ...emptyIndustrySpecificData,
        }),
      });
      renderPage({ userData });
      clickSave();
      await waitFor(() => {
        expect(
          screen.getAllByText(Config.profileDefaults.essentialQuestionInlineText)[0]
        ).toBeInTheDocument();
      });
    }
  );

  describe("Nexus Foreign Business", () => {
    const nexusForeignBusinessProfile = ({
      profileDataOverrides,
      formationDataOverrides,
      taxFilingDataOverrides,
    }: {
      profileDataOverrides?: Partial<ProfileData>;
      formationDataOverrides?: Partial<FormationData>;
      taxFilingDataOverrides?: Partial<TaxFilingData>;
    }): UserData => {
      return generateUserData({
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessType: "NEXUS",
          foreignBusinessTypeIds: ["NEXUS"],
          legalStructureId: "limited-liability-company",
          ...profileDataOverrides,
        }),
        formationData: generateFormationData({
          ...formationDataOverrides,
        }),
        taxFilingData: generateTaxFilingData({
          ...taxFilingDataOverrides,
        }),
      });
    };

    it("opens the default business information tab when clicked on profile", () => {
      renderPage({ userData: nexusForeignBusinessProfile({}) });
      expect(screen.getByTestId("info")).toBeInTheDocument();
      expect(
        screen.getByText(markdownToText(Config.profileDefaults.fields.industryId.default.header))
      ).toBeInTheDocument();
      expect(
        screen.getByText(markdownToText(Config.profileDefaults.fields.legalStructureId.default.header))
      ).toBeInTheDocument();
    });

    it("displays the out of state business name field", () => {
      renderPage({ userData: nexusForeignBusinessProfile({}) });
      expect(
        screen.getByText(Config.profileDefaults.fields.nexusBusinessName.default.outOfStateNameHeader)
      ).toBeInTheDocument();
    });

    it("displays Not Entered when the user hasn't entered a business name yet", () => {
      renderPage({
        userData: generateUserData({
          profileData: generateProfileData({
            businessPersona: "FOREIGN",
            foreignBusinessType: "NEXUS",
            legalStructureId: "limited-liability-company",
            businessName: "",
          }),
        }),
      });

      expect(
        screen.getByText(Config.profileDefaults.fields.nexusBusinessName.default.emptyBusinessPlaceHolder)
      ).toBeInTheDocument();
    });

    it("does not display out-of-state business name when SP/GP", () => {
      renderPage({
        userData: nexusForeignBusinessProfile({
          profileDataOverrides: { legalStructureId: "sole-proprietorship" },
        }),
      });

      expect(
        screen.queryByText(Config.profileDefaults.fields.nexusBusinessName.default.outOfStateNameHeader)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(Config.profileDefaults.fields.nexusDbaName.default.header)
      ).not.toBeInTheDocument();
    });

    it("displays the user's business name if they have one", () => {
      renderPage({
        userData: nexusForeignBusinessProfile({ profileDataOverrides: { businessName: "Test Business" } }),
      });
      expect(within(screen.getByTestId("main")).getByText("Test Business")).toBeInTheDocument();
    });

    it("displays the user's dba name if they have one", () => {
      renderPage({
        userData: nexusForeignBusinessProfile({
          profileDataOverrides: {
            businessName: "Test Business",
            nexusDbaName: "DBA Name",
          },
        }),
      });
      expect(within(screen.getByTestId("main")).getByText("Test Business")).toBeInTheDocument();
      expect(
        screen.getByText(markdownToText(Config.profileDefaults.fields.nexusDbaName.default.header))
      ).toBeInTheDocument();
    });

    it("doesn't display the user's dba name if they don't have one", () => {
      renderPage({
        userData: nexusForeignBusinessProfile({
          profileDataOverrides: {
            businessName: "Test Business",
            nexusDbaName: "",
          },
        }),
      });
      expect(within(screen.getByTestId("main")).getByText("Test Business")).toBeInTheDocument();
      expect(
        screen.queryByText(Config.profileDefaults.fields.nexusDbaName.default.header)
      ).not.toBeInTheDocument();
    });

    describe("location", () => {
      const renderWithLegalStructureAndPhase = (params: {
        legalStructureId: string;
        operatingPhase: OperatingPhaseId;
      }): void => {
        const newark = generateMunicipality({ displayName: "Newark" });
        const userData = generateUserData({
          profileData: generateProfileData({
            legalStructureId: params.legalStructureId,
            operatingPhase: params.operatingPhase,
            businessPersona: "FOREIGN",
            foreignBusinessType: "NEXUS",
            foreignBusinessTypeIds: ["NEXUS"],
            nexusLocationInNewJersey: true,
          }),
        });
        renderPage({ municipalities: [newark], userData });
      };

      it("locks when it is populated and tax filing state is SUCCESS", () => {
        renderPage({
          userData: generateUserData({
            profileData: generateProfileData({
              municipality: generateMunicipality({ displayName: "Trenton" }),
              legalStructureId: randomLegalStructure().id,
              businessPersona: "FOREIGN",
              foreignBusinessType: "NEXUS",
              foreignBusinessTypeIds: ["NEXUS"],
              nexusLocationInNewJersey: true,
            }),
            taxFilingData: generateTaxFilingData({
              state: "SUCCESS",
            }),
          }),
        });
        expect(screen.getByText("Trenton")).toBeInTheDocument();
        expect(screen.getByTestId("locked-municipality")).toBeInTheDocument();
      });

      describe("when location is optional", () => {
        describe("legalStructure is Public Filing and operating Phase is GUEST_MODE or NEEDS_TO_FORM", () => {
          const allPublicFilingLegalStructures = allLegalStructuresOfType({ type: "publicFiling" }).map(
            (it) => {
              return it.id;
            }
          );
          const operatingPhases: OperatingPhaseId[] = ["GUEST_MODE", "NEEDS_TO_FORM"];

          for (const legalStructure of allPublicFilingLegalStructures) {
            for (const operatingPhase of operatingPhases) {
              it(`allows saving with empty location for ${legalStructure} in ${operatingPhase}`, async () => {
                renderWithLegalStructureAndPhase({
                  legalStructureId: legalStructure,
                  operatingPhase: operatingPhase,
                });
                removeLocationAndSave();
                await expectLocationSavedAsUndefined();
              });
            }
          }
        });

        describe("legalStructure is Trade Name and operating Phase is GUEST_MODE or NEEDS_TO_REGISTER", () => {
          const allTradeNameLegalStructures = allLegalStructuresOfType({ type: "tradeName" }).map((it) => {
            return it.id;
          });
          const operatingPhases: OperatingPhaseId[] = ["GUEST_MODE", "NEEDS_TO_REGISTER_FOR_TAXES"];

          for (const legalStructure of allTradeNameLegalStructures) {
            for (const operatingPhase of operatingPhases) {
              it(`allows saving with empty location for ${legalStructure} in ${operatingPhase}`, async () => {
                renderWithLegalStructureAndPhase({
                  legalStructureId: legalStructure,
                  operatingPhase: operatingPhase,
                });
                removeLocationAndSave();
                await expectLocationSavedAsUndefined();
              });
            }
          }
        });
      });

      describe("when location is required", () => {
        describe("legalStructure is Public Filing and operating Phase is NEEDS_TO_REGISTER_FOR_TAXES or FORMED_AND_REGISTERED", () => {
          const allPublicFilingLegalStructures = allLegalStructuresOfType({ type: "publicFiling" }).map(
            (it) => {
              return it.id;
            }
          );
          const operatingPhases: OperatingPhaseId[] = [
            "NEEDS_TO_REGISTER_FOR_TAXES",
            "FORMED_AND_REGISTERED",
          ];
          for (const legalStructure of allPublicFilingLegalStructures) {
            for (const operatingPhase of operatingPhases) {
              it(`prevents saving with empty location for ${legalStructure} in ${operatingPhase}`, async () => {
                renderWithLegalStructureAndPhase({
                  legalStructureId: legalStructure,
                  operatingPhase: operatingPhase,
                });
                removeLocationAndSave();
                expectLocationNotSavedAndError();
              });
            }
          }
        });

        describe("legalStructure is Trade Name and operating Phase is FORMED_AND_REGISTERED", () => {
          const allTradeNameLegalStructures = allLegalStructuresOfType({ type: "tradeName" }).map((it) => {
            return it.id;
          });
          for (const legalStructure of allTradeNameLegalStructures) {
            it(`prevents saving with empty location for ${legalStructure}`, async () => {
              renderWithLegalStructureAndPhase({
                legalStructureId: legalStructure,
                operatingPhase: "FORMED_AND_REGISTERED",
              });
              removeLocationAndSave();
              expectLocationNotSavedAndError();
            });
          }
        });
      });
    });

    describe("ProfileDateOfFormation", () => {
      it("displays the date of formation input field when date of formation has been submitted", () => {
        renderPage({
          userData: nexusForeignBusinessProfile({
            profileDataOverrides: {
              dateOfFormation: getCurrentDateFormatted(defaultDateFormat),
            },
          }),
        });
        expect(
          screen.getByText(Config.profileDefaults.fields.dateOfFormation.default.header)
        ).toBeInTheDocument();
      });

      it("updates the date of formation to a future date", () => {
        renderPage({
          userData: nexusForeignBusinessProfile({
            profileDataOverrides: {
              dateOfFormation: getCurrentDateFormatted(defaultDateFormat),
            },
          }),
        });

        fireEvent.change(screen.getByLabelText("Date of formation"), { target: { value: "09/2025" } });
        fireEvent.blur(screen.getByLabelText("Date of formation"));
        expect(
          screen.queryByText(Config.profileDefaults.fields.dateOfFormation.default.errorTextRequired)
        ).not.toBeInTheDocument();
      });

      it("does not display the date of formation input field when date of formation has not been submitted", () => {
        renderPage({
          userData: nexusForeignBusinessProfile({
            profileDataOverrides: {
              dateOfFormation: undefined,
            },
          }),
        });
        expect(
          screen.queryByText(Config.profileDefaults.fields.dateOfFormation.default.header)
        ).not.toBeInTheDocument();
      });

      it("locks the date of formation input field when the business has successfully formed", () => {
        renderPage({
          userData: nexusForeignBusinessProfile({
            profileDataOverrides: {
              dateOfFormation: getCurrentDateFormatted(defaultDateFormat),
            },
            formationDataOverrides: {
              completedFilingPayment: true,
            },
          }),
        });
        expect(screen.queryByLabelText("Date of formation")).not.toBeInTheDocument();
      });
    });

    describe("locks fields when formation getFiling success", () => {
      const legalStructure = "limited-liability-company";
      const municipality = generateMunicipality({
        displayName: "some-cool-town",
      });

      const foreignNexusUserData = generateUserData({
        formationData: generateFormationData({
          completedFilingPayment: true,
        }),
        profileData: generateProfileData({
          dateOfFormation: "2020-01-02",
          businessPersona: "FOREIGN",
          foreignBusinessType: "NEXUS",
          foreignBusinessTypeIds: ["NEXUS"],
          legalStructureId: legalStructure,
          entityId: "some-id",
          businessName: "some-name",
          municipality: municipality,
        }),
      });

      it("locks legalStructure", async () => {
        renderPage({ userData: foreignNexusUserData });
        expect(screen.getByTestId("info")).toBeInTheDocument();
        expect(
          screen.getByText(Config.profileDefaults.fields.legalStructureId.default.header)
        ).toBeInTheDocument();
        expect(screen.getByText(LookupLegalStructureById(legalStructure).name)).toBeInTheDocument();
        expect(screen.queryByText(Config.profileDefaults.lockedFieldTooltipText)).not.toBeInTheDocument();

        expect(screen.queryByText("business-structure-task-link")).not.toBeInTheDocument();

        fireEvent.mouseOver(screen.getByTestId("legalStructureId-locked-tooltip"));
        await screen.findByText(Config.profileDefaults.lockedFieldTooltipText);
      });
    });
  });
});
