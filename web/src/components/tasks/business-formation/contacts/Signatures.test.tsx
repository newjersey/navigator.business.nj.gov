/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getPageHelper } from "@/components/tasks/business-formation/contacts/testHelpers";
import { getMergedConfig } from "@/contexts/configContext";
import { templateEval } from "@/lib/utils/helpers";
import { FormationPageHelpers, useSetupInitialMocks } from "@/test/helpers/helpers-formation";
import { currentBusiness } from "@/test/mock/withStatefulUserData";
import {
  BusinessSignerTypeMap,
  FormationLegalType,
  PublicFilingLegalType,
  castPublicFilingLegalTypeToFormationType,
  generateFormationFormData,
  generateFormationSigner,
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

  describe("starting legal structures", () => {
    it.each([...legalStructureIds])(
      "adds additional signer when legalStructure is %s",
      async (legalStructureId) => {
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
      }
    );

    it.each([...legalStructureIds])(
      "deletes an additional signer when legalStructure is %s",
      async (legalStructureId) => {
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
      }
    );

    it.each([...legalStructureIds])(
      "does not add more than 9 additional signers when legalStructure is %s",
      async (legalStructureId) => {
        const signers = Array(9).fill(generateFormationSigner({}, legalStructureId));
        const page = await getPageHelper({ legalStructureId }, { signers });

        expect(screen.getByText(Config.formation.fields.signers.addButtonText)).toBeInTheDocument();
        page.clickAddNewSigner();
        expect(screen.queryByText(Config.formation.fields.signers.addButtonText)).not.toBeInTheDocument();
      }
    );

    it.each([...legalStructureIds])(
      "displays inline error to both enter name and sign if both are missing when legalStructure is %s",
      async (legalStructureId) => {
        const formationFormData = generateFormationFormData({ signers: undefined }, { legalStructureId });
        const page = await getPageHelper({ legalStructureId }, formationFormData);
        await attemptApiSubmission(page);
        expect(
          screen.getByText(Config.formation.fields.signers.errorInlineNameAndSignature)
        ).toBeInTheDocument();
      }
    );

    it.each([...legalStructureIds])(
      "displays inline error to enter name if only name is missing when legalStructure is %s",
      async (legalStructureId) => {
        const formationFormData = generateFormationFormData(
          {
            signers: [
              generateFormationSigner({
                name: "",
                signature: true,
              }),
            ],
          },
          { legalStructureId }
        );
        const page = await getPageHelper({ legalStructureId }, formationFormData);
        await attemptApiSubmission(page);
        expect(screen.getByText(Config.formation.fields.signers.errorInlineSignerName)).toBeInTheDocument();
      }
    );

    it.each([...legalStructureIds])(
      "displays inline error to sign if only signature is missing when legalStructure is %s",
      async (legalStructureId) => {
        const formationFormData = generateFormationFormData(
          {
            signers: [
              generateFormationSigner({
                name: "Reginald Von Harris",
                signature: false,
              }),
            ],
          },
          { legalStructureId }
        );
        const page = await getPageHelper({ legalStructureId }, formationFormData);
        await attemptApiSubmission(page);
        expect(screen.getByText(Config.formation.fields.signers.errorInlineSignature)).toBeInTheDocument();
      }
    );

    it.each([...legalStructureIds])(
      "displays inline error when signer name longer than 50 chars when legalStructure is %s",
      async (legalStructureId) => {
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
            { exact: true }
          );
        };
        expect(signerErrorText()).toBeInTheDocument();
        page.fillText("Signer 0", "Elrond");
        expect(signerErrorText()).not.toBeInTheDocument();
      }
    );
  });

  describe("foreign legal structures", () => {
    const legalType = (legalStructureId: PublicFilingLegalType): FormationLegalType =>
      castPublicFilingLegalTypeToFormationType(legalStructureId, "FOREIGN");

    it.each([...legalStructureIds])(
      "selects a signer type when legalStructure is %s",
      async (legalStructureId) => {
        const page = await getPageHelper(
          { businessPersona: "FOREIGN", legalStructureId },
          { signers: undefined }
        );
        const signers = [
          generateFormationSigner({ signature: true }, legalType(legalStructureId)),
          generateFormationSigner({ signature: true }, legalType(legalStructureId)),
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
      }
    );

    it.each([...legalStructureIds])(
      "displays inline error when signer name longer than 50 chars when legalStructure is %s",
      async (legalStructureId) => {
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
            { exact: true }
          );
        };
        expect(signerErrorText()).toBeInTheDocument();
        page.fillText("Signer 0", "Elrond");
        expect(signerErrorText()).not.toBeInTheDocument();
      }
    );

    it.each([...legalStructureIds])(
      "displays inline error when name, signature, and type is missing when legalStructure is %s",
      async (legalStructureId) => {
        const page = await getPageHelper({ businessPersona: "FOREIGN", legalStructureId }, { signers: [] });

        await attemptApiSubmission(page);
        const singerNameAndSignatureErrorType = (): HTMLElement | null => {
          return screen.queryByText(Config.formation.fields.signers.errorInlineNameAndSignature);
        };
        const signerTitleErrorType = (): HTMLElement | null => {
          return screen.queryByText(Config.formation.fields.signers.errorInlineSignerTitle);
        };
        expect(singerNameAndSignatureErrorType()).toBeInTheDocument();
        expect(signerTitleErrorType()).toBeInTheDocument();
      }
    );

    it.each([...legalStructureIds])(
      "displays inline error when name is missing for first signer when legalStructure is %s",
      async (legalStructureId) => {
        const page = await getPageHelper(
          { businessPersona: "FOREIGN", legalStructureId },
          { signers: [generateFormationSigner({ name: "", title: "General Partner", signature: true })] }
        );

        await attemptApiSubmission(page);
        const singerNameErrorType = (): HTMLElement | null => {
          return screen.queryByText(Config.formation.fields.signers.errorInlineSignerName);
        };
        expect(singerNameErrorType()).toBeInTheDocument();
      }
    );

    it.each([...legalStructureIds])(
      "displays inline error when name is missing for second signer when legalStructure is %s",
      async (legalStructureId) => {
        const page = await getPageHelper(
          { businessPersona: "FOREIGN", legalStructureId },
          {
            signers: [
              generateFormationSigner({ title: "General Partner" }),
              generateFormationSigner({ name: "", title: "General Partner", signature: true }),
            ],
          }
        );

        page.clickAddNewSigner();
        await attemptApiSubmission(page);
        const additionalSignerNameErrorText = (): HTMLElement | null => {
          return screen.queryByText(Config.formation.fields.signers.errorInlineAdditionalSignerName);
        };
        expect(additionalSignerNameErrorText()).toBeInTheDocument();
      }
    );

    it.each([...legalStructureIds])(
      "displays inline error when signers do not fill out the type field when legalStructure is %s",
      async (legalStructureId) => {
        const page = await getPageHelper(
          { businessPersona: "FOREIGN", legalStructureId },
          { signers: [generateFormationSigner({ title: undefined })] }
        );

        await attemptApiSubmission(page);
        const signerTypeErrorText = (): HTMLElement | null => {
          return screen.queryByText(Config.formation.fields.signers.errorInlineSignerTitle);
        };
        expect(signerTypeErrorText()).toBeInTheDocument();
        page.selectByText("Signer title 0", BusinessSignerTypeMap[legalType(legalStructureId)][0]);
        expect(signerTypeErrorText()).not.toBeInTheDocument();
        await page.submitContactsStep();
      }
    );

    it.each([...legalStructureIds])(
      "displays inline error when the signature is missing when legalStructure is %s",
      async (legalStructureId) => {
        const page = await getPageHelper(
          { businessPersona: "FOREIGN", legalStructureId },
          {
            signers: [
              generateFormationSigner({
                name: "Reginald Von Harris",
                title: "General Partner",
                signature: false,
              }),
            ],
          }
        );

        await attemptApiSubmission(page);
        const signatureMissingErrorText = (): HTMLElement | null => {
          return screen.queryByText(Config.formation.fields.signers.errorInlineSignature);
        };
        expect(signatureMissingErrorText()).toBeInTheDocument();
      }
    );
  });

  const attemptApiSubmission = async (page: FormationPageHelpers): Promise<void> => {
    await page.stepperClickToReviewStep();
    await page.clickSubmit();
    await page.stepperClickToContactsStep();
  };
});
