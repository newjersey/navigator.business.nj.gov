/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getPageHelper } from "@/components/tasks/business-formation/contacts/testHelpers";
import { getMergedConfig } from "@/contexts/configContext";
import { templateEval } from "@/lib/utils/helpers";
import { FormationPageHelpers, useSetupInitialMocks } from "@/test/helpers/helpers-formation";
import { currentBusiness } from "@/test/mock/withStatefulUserData";
import {
  BusinessSignerTypeMap,
  castPublicFilingLegalTypeToFormationType,
  FormationLegalType,
  generateFormationSigner,
  PublicFilingLegalType,
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { fireEvent, screen } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

const Config = getMergedConfig();

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
  searchBusinessName: jest.fn(),
}));

describe("Formation - Signatures", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const legalStructureIds: PublicFilingLegalType[] = [
    "limited-liability-company",
    "limited-liability-partnership",
  ];

  legalStructureIds.map((legalStructureId) => {
    describe(`for ${legalStructureId}`, () => {
      it("adds additional signer", async () => {
        const page = await getPageHelper({ legalStructureId }, { signers: [] });
        page.fillText("Signer 0", "Red Skull");
        page.checkSignerBox(0, "signers");

        page.clickAddNewSigner();
        page.fillText("Signer 1", "V");
        page.checkSignerBox(1, "signers");

        await page.submitContactsStep();
        expect(currentBusiness().formationData.formationFormData.signers).toEqual([
          generateFormationSigner(
            {
              name: "Red Skull",
              signature: true,
            },
            legalStructureId
          ),
          generateFormationSigner(
            {
              name: "V",
              signature: true,
            },
            legalStructureId
          ),
        ]);
      });

      it("deletes an additional signer", async () => {
        const page = await getPageHelper({ legalStructureId }, { signers: [] });
        page.fillText("Signer 0", "Red Skull");
        page.checkSignerBox(0, "signers");

        page.clickAddNewSigner();
        page.fillText("Signer 1", "V");
        page.checkSignerBox(1, "signers");

        fireEvent.click(screen.getAllByLabelText("delete additional signer")[0]);

        await page.submitContactsStep();
        expect(currentBusiness().formationData.formationFormData.signers).toEqual([
          generateFormationSigner(
            {
              name: "Red Skull",
              signature: true,
            },
            legalStructureId
          ),
        ]);
      });

      it("does not add more than 9 additional signers", async () => {
        const signers = Array(9).fill(generateFormationSigner({}, legalStructureId));
        const page = await getPageHelper({ legalStructureId }, { signers });

        expect(screen.getByText(Config.formation.fields.signers.addButtonText)).toBeInTheDocument();
        page.clickAddNewSigner();
        expect(screen.queryByText(Config.formation.fields.signers.addButtonText)).not.toBeInTheDocument();
      });

      it("fires validations when signers do not fill out the signature field", async () => {
        const page = await getPageHelper(
          { legalStructureId },
          { signers: [generateFormationSigner({ name: "" }, legalStructureId)] }
        );
        await attemptApiSubmission(page);
        const signerErrorText = (): HTMLElement | null => {
          return screen.queryByText(Config.formation.fields.signers.errorBannerSignerName);
        };
        expect(signerErrorText()).toBeInTheDocument();
        page.fillText("Signer 0", "Elrond");
        expect(signerErrorText()).not.toBeInTheDocument();
      });

      it("fires validations when signer name longer than 50 chars", async () => {
        const page = await getPageHelper(
          { legalStructureId },
          {
            signers: [
              generateFormationSigner(
                { name: Array(51).fill("A").join(","), signature: true },
                legalStructureId
              ),
            ],
          }
        );
        await attemptApiSubmission(page);
        const signerErrorText = (): HTMLElement | null => {
          return screen.queryByText(
            templateEval(Config.formation.general.maximumLengthErrorText, {
              field: Config.formation.fields.signers.label,
              maxLen: "50",
            }),
            { exact: false }
          );
        };
        expect(signerErrorText()).toBeInTheDocument();
        page.fillText("Signer 0", "Elrond");
        expect(signerErrorText()).not.toBeInTheDocument();
      });

      it("fires validations when signers do not check the sign checkbox", async () => {
        const page = await getPageHelper(
          { legalStructureId },
          { signers: [generateFormationSigner({ signature: false }, legalStructureId)] }
        );
        await attemptApiSubmission(page);
        const signerCheckboxErrorText = (): HTMLElement | null => {
          return screen.queryByText(Config.formation.fields.signers.errorBannerCheckbox, {
            exact: false,
          });
        };
        expect(signerCheckboxErrorText()).toBeInTheDocument();
        page.selectCheckbox(`${Config.formation.fields.signers.signColumnLabel}*`);
        expect(signerCheckboxErrorText()).not.toBeInTheDocument();
        await page.submitContactsStep();
      });

      it("shows inline error message for missing primary signer", async () => {
        const page = await getPageHelper(
          { legalStructureId },
          {
            signers: [
              generateFormationSigner({ name: "", signature: true }, legalStructureId),
              generateFormationSigner({ name: "some name", signature: true }, legalStructureId),
            ],
          }
        );
        await attemptApiSubmission(page);
        expect(
          screen.getByText(Config.formation.fields.signers.errorInlineFirstSignerName)
        ).toBeInTheDocument();
        expect(
          screen.queryByText(Config.formation.fields.signers.errorInlineAdditionalSignerName)
        ).not.toBeInTheDocument();
      });

      it("shows inline error message for missing additional signer", async () => {
        const page = await getPageHelper(
          { legalStructureId },
          {
            signers: [
              generateFormationSigner({ name: "some name", signature: true }, legalStructureId),
              generateFormationSigner({ name: "", signature: true }, legalStructureId),
            ],
          }
        );
        await attemptApiSubmission(page);
        expect(
          screen.getByText(Config.formation.fields.signers.errorInlineAdditionalSignerName)
        ).toBeInTheDocument();
        expect(
          screen.queryByText(Config.formation.fields.signers.errorInlineFirstSignerName)
        ).not.toBeInTheDocument();
      });
    });

    describe("foreign legal structures", () => {
      describe(`for ${legalStructureId}`, () => {
        const legalType: FormationLegalType = castPublicFilingLegalTypeToFormationType(
          legalStructureId,
          "FOREIGN"
        );

        it("fires validations when signers do not fill out the type field", async () => {
          const page = await getPageHelper(
            { businessPersona: "FOREIGN", legalStructureId },
            { signers: [generateFormationSigner({ title: undefined })] }
          );

          await attemptApiSubmission(page);
          const signerTypeErrorText = (): HTMLElement | null => {
            return screen.queryByText(Config.formation.fields.signers.errorBannerSignerTitle);
          };
          expect(signerTypeErrorText()).toBeInTheDocument();
          page.selectByText("Signer title 0", BusinessSignerTypeMap[legalType][0]);
          expect(signerTypeErrorText()).not.toBeInTheDocument();
          await page.submitContactsStep();
        });

        it("selects a signer type", async () => {
          const page = await getPageHelper(
            { businessPersona: "FOREIGN", legalStructureId },
            { signers: undefined }
          );
          const signers = [
            generateFormationSigner({ signature: true }, legalType),
            generateFormationSigner({ signature: true }, legalType),
          ];
          page.fillText("Signer 0", signers[0].name);
          page.selectByText("Signer title 0", signers[0].title);
          page.checkSignerBox(0, "signers");

          page.clickAddNewSigner();
          page.fillText("Signer 1", signers[1].name);
          page.selectByText("Signer title 1", signers[1].title);
          page.checkSignerBox(1, "signers");

          await page.submitContactsStep();
          expect(currentBusiness().formationData.formationFormData.signers).toEqual(signers);
        });
      });
    });
  });

  const attemptApiSubmission = async (page: FormationPageHelpers): Promise<void> => {
    await page.stepperClickToReviewStep();
    await page.clickSubmit();
    await page.stepperClickToContactsStep();
  };
});
