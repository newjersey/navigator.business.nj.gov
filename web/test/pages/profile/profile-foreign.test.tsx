/* eslint-disable jest/expect-expect */
import { getMergedConfig } from "@/contexts/configContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { allLegalStructuresOfType, randomHomeBasedIndustry } from "@/test/factories";
import { markdownToText } from "@/test/helpers/helpers-utilities";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { currentBusiness, setupStatefulUserDataContext } from "@/test/mock/withStatefulUserData";
import {
  Business,
  FormationData,
  LookupLegalStructureById,
  OperatingPhaseId,
  ProfileData,
  TaxFilingData,
  defaultDateFormat,
  emptyIndustrySpecificData,
  generateMunicipality,
  generateProfileData,
  getCurrentDateFormatted,
} from "@businessnjgovnavigator/shared";
import {
  generateFormationData,
  generateTaxFilingData,
  randomLegalStructure,
} from "@businessnjgovnavigator/shared/test";

import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { industryIdsWithSingleRequiredEssentialQuestion } from "@/test/pages/onboarding/helpers-onboarding";
import {
  clickBack,
  clickSave,
  expectLocationNotSavedAndError,
  expectLocationSavedAsUndefined,
  generateBusinessForProfile,
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
  let setupBusiness: Business;

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockRoadmap({});
    setupStatefulUserDataContext();
    setupBusiness = generateBusinessForProfile({
      profileData: generateProfileData({ businessPersona: "FOREIGN" }),
    });
  });

  it("sends user back to dashboard", async () => {
    renderPage({ business: setupBusiness });
    clickBack();
    await waitFor(() => {
      return expect(mockRouter.mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
    });
  });

  it("does not display the documents tab", () => {
    renderPage({ business: setupBusiness });
    expect(screen.getAllByText(Config.profileDefaults.default.profileTabNumbersTitle).length).toBeGreaterThan(
      0
    );
    expect(screen.getAllByText(Config.profileDefaults.default.profileTabNoteTitle).length).toBeGreaterThan(0);
    expect(screen.getAllByText(Config.profileDefaults.default.profileTabInfoTitle).length).toBeGreaterThan(0);
    expect(screen.queryByText(Config.profileDefaults.default.profileTabDocsTitle)).not.toBeInTheDocument();
  });

  it("does not show the home-based question if locationInNewJersey=true, even if industry applicable", () => {
    renderPage({
      business: generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: ["employeeOrContractorInNJ", "officeInNJ"],
          industryId: randomHomeBasedIndustry(),
        }),
      }),
    });
    expect(screen.queryByText("Home-based business")).not.toBeInTheDocument();
  });

  it.each(industryIdsWithSingleRequiredEssentialQuestion)(
    "prevents Foreign Nexus user from saving when %s is selected as industry, but essential question is not answered",
    async (industryId) => {
      const business = generateBusinessForProfile({
        onboardingFormProgress: "UNSTARTED",
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          industryId: industryId,
          foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
          ...emptyIndustrySpecificData,
        }),
      });
      renderPage({ business });
      clickSave();
      await waitFor(() => {
        expect(screen.getAllByText(Config.siteWideErrorMessages.errorRadioButton)[0]).toBeInTheDocument();
      });
    }
  );

  it("prevents Foreign Nexus user from saving when employment agency is selected as industry, but essential question is not answered", async () => {
    const business = generateBusinessForProfile({
      onboardingFormProgress: "UNSTARTED",
      profileData: generateProfileData({
        businessPersona: "FOREIGN",
        industryId: "employment-agency",
        foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
        ...emptyIndustrySpecificData,
      }),
    });
    renderPage({ business });
    clickSave();
    await waitFor(() => {
      expect(screen.getAllByText(Config.siteWideErrorMessages.errorRadioButton)[0]).toBeInTheDocument();
    });
  });

  describe("Nexus Foreign Business", () => {
    const nexusForeignBusinessProfile = ({
      profileDataOverrides,
      formationDataOverrides,
      taxFilingDataOverrides,
    }: {
      profileDataOverrides?: Partial<ProfileData>;
      formationDataOverrides?: Partial<FormationData>;
      taxFilingDataOverrides?: Partial<TaxFilingData>;
    }): Business => {
      return generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
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

    it("sets homeBasedBusiness value to false when officeInNJ is checked", async () => {
      renderPage({
        business: nexusForeignBusinessProfile({
          profileDataOverrides: {
            foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
            homeBasedBusiness: true,
          },
        }),
      });
      fireEvent.click(
        screen.getByRole("checkbox", {
          name: Config.profileDefaults.fields.foreignBusinessTypeIds.default.optionContent.officeInNJ,
        })
      );
      clickSave();
      await waitFor(() => {
        expect(currentBusiness().profileData.homeBasedBusiness).toBe(false);
      });
    });

    it("doesn't change the homeBasedBusiness value when officeInNJ value is changed", async () => {
      renderPage({
        business: nexusForeignBusinessProfile({
          profileDataOverrides: {
            foreignBusinessTypeIds: ["employeeOrContractorInNJ", "officeInNJ"],
            homeBasedBusiness: false,
          },
        }),
      });
      fireEvent.click(
        screen.getByRole("checkbox", {
          name: Config.profileDefaults.fields.foreignBusinessTypeIds.default.optionContent.officeInNJ,
        })
      );
      clickSave();
      await waitFor(() => {
        expect(currentBusiness().profileData.homeBasedBusiness).toBe(false);
      });
    });

    it("opens the default business information tab when clicked on profile", () => {
      renderPage({ business: nexusForeignBusinessProfile({}) });
      expect(screen.getByTestId("info")).toBeInTheDocument();
      expect(
        screen.getByText(markdownToText(Config.profileDefaults.fields.industryId.default.header))
      ).toBeInTheDocument();
      expect(
        screen.getByText(markdownToText(Config.profileDefaults.fields.legalStructureId.default.header))
      ).toBeInTheDocument();
    });

    it("displays the out of state business name field", () => {
      renderPage({ business: nexusForeignBusinessProfile({}) });
      expect(
        screen.getByText(Config.profileDefaults.fields.nexusBusinessName.default.outOfStateNameHeader)
      ).toBeInTheDocument();
    });

    it("displays Not Entered when the user hasn't entered a business name yet", () => {
      renderPage({
        business: generateBusinessForProfile({
          profileData: generateProfileData({
            businessPersona: "FOREIGN",
            foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
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
        business: nexusForeignBusinessProfile({
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
        business: nexusForeignBusinessProfile({ profileDataOverrides: { businessName: "Test Business" } }),
      });
      expect(within(screen.getByTestId("main")).getByText("Test Business")).toBeInTheDocument();
    });

    it("displays the user's dba name if they have one", () => {
      renderPage({
        business: nexusForeignBusinessProfile({
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
        business: nexusForeignBusinessProfile({
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
        const business = generateBusinessForProfile({
          profileData: generateProfileData({
            legalStructureId: params.legalStructureId,
            operatingPhase: params.operatingPhase,
            businessPersona: "FOREIGN",
            foreignBusinessTypeIds: ["employeeOrContractorInNJ", "officeInNJ"],
          }),
        });
        renderPage({ business });
      };

      it("locks when it is populated and tax filing state is SUCCESS", () => {
        renderPage({
          business: generateBusinessForProfile({
            profileData: generateProfileData({
              municipality: generateMunicipality({ displayName: "Trenton" }),
              legalStructureId: randomLegalStructure().id,
              businessPersona: "FOREIGN",
              foreignBusinessTypeIds: ["employeeOrContractorInNJ", "officeInNJ"],
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
          const operatingPhases: OperatingPhaseId[] = [
            OperatingPhaseId.GUEST_MODE,
            OperatingPhaseId.NEEDS_TO_FORM,
          ];

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

        describe("legalStructure is Trade Name and operating Phase is GUEST_MODE", () => {
          const allTradeNameLegalStructures = allLegalStructuresOfType({ type: "tradeName" }).map((it) => {
            return it.id;
          });

          for (const legalStructure of allTradeNameLegalStructures) {
            it(`allows saving with empty location for ${legalStructure} in GUEST_MODE`, async () => {
              renderWithLegalStructureAndPhase({
                legalStructureId: legalStructure,
                operatingPhase: OperatingPhaseId.GUEST_MODE,
              });
              removeLocationAndSave();
              await expectLocationSavedAsUndefined();
            });
          }
        });
      });

      describe("when location is required", () => {
        describe("legalStructure is Public Filing and operating Phase is FORMED", () => {
          const allPublicFilingLegalStructures = allLegalStructuresOfType({ type: "publicFiling" }).map(
            (it) => {
              return it.id;
            }
          );

          for (const legalStructure of allPublicFilingLegalStructures) {
            it(`prevents saving with empty location for ${legalStructure} in FORMED`, async () => {
              renderWithLegalStructureAndPhase({
                legalStructureId: legalStructure,
                operatingPhase: OperatingPhaseId.FORMED,
              });
              removeLocationAndSave();
              expectLocationNotSavedAndError();
            });
          }
        });

        describe("legalStructure is Trade Name and operating Phase is FORMED", () => {
          const allTradeNameLegalStructures = allLegalStructuresOfType({ type: "tradeName" }).map((it) => {
            return it.id;
          });
          for (const legalStructure of allTradeNameLegalStructures) {
            it(`prevents saving with empty location for ${legalStructure}`, async () => {
              renderWithLegalStructureAndPhase({
                legalStructureId: legalStructure,
                operatingPhase: OperatingPhaseId.FORMED,
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
          business: nexusForeignBusinessProfile({
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
          business: nexusForeignBusinessProfile({
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
          business: nexusForeignBusinessProfile({
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
          business: nexusForeignBusinessProfile({
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

      const foreignNexusUserData = generateBusinessForProfile({
        formationData: generateFormationData({
          completedFilingPayment: true,
        }),
        profileData: generateProfileData({
          dateOfFormation: "2020-01-02",
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
          legalStructureId: legalStructure,
          entityId: "some-id",
          businessName: "some-name",
          municipality: municipality,
        }),
      });

      it("locks legalStructure", async () => {
        renderPage({ business: foreignNexusUserData });
        expect(screen.getByTestId("info")).toBeInTheDocument();
        expect(
          screen.getByText(Config.profileDefaults.fields.legalStructureId.default.header)
        ).toBeInTheDocument();
        expect(screen.getByText(LookupLegalStructureById(legalStructure).name)).toBeInTheDocument();
        expect(
          screen.queryByText(Config.profileDefaults.default.lockedFieldTooltipText)
        ).not.toBeInTheDocument();

        expect(screen.queryByText("business-structure-task-link")).not.toBeInTheDocument();

        fireEvent.mouseOver(screen.getByTestId("legalStructureId-locked-tooltip"));
        await screen.findByText(Config.profileDefaults.default.lockedFieldTooltipText);
      });
    });
  });

  describe("Remote Worker", () => {
    const foreignRemoteWorkerProfile = generateBusinessForProfile({
      profileData: generateProfileData({
        businessPersona: "FOREIGN",
        foreignBusinessTypeIds: ["employeesInNJ"],
      }),
    });

    it("renders the business name field for remote worker", () => {
      renderPage({ business: foreignRemoteWorkerProfile });
      expect(screen.getByTestId("businessName")).toBeInTheDocument();
    });
  });

  describe("Remote Seller", () => {
    const foreignRemoteSellerProfile = generateBusinessForProfile({
      profileData: generateProfileData({
        businessPersona: "FOREIGN",
        foreignBusinessTypeIds: ["revenueInNJ", "transactionsInNJ"],
      }),
    });

    it("renders the business name field for remote seller", () => {
      renderPage({ business: foreignRemoteSellerProfile });
      expect(screen.getByTestId("businessName")).toBeInTheDocument();
    });
  });
});
