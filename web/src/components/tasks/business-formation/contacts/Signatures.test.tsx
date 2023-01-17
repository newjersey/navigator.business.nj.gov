/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getPageHelper } from "@/components/tasks/business-formation/contacts/testHelpers";
import { FormationPageHelpers, useSetupInitialMocks } from "@/test/helpers/helpers-formation";
import { currentUserData } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
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
        expect(currentUserData().formationData.formationFormData.signers).toEqual([
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
        expect(currentUserData().formationData.formationFormData.signers).toEqual([
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

        expect(
          screen.getByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false })
        ).toBeInTheDocument();
        page.clickAddNewSigner();
        expect(
          screen.queryByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false })
        ).not.toBeInTheDocument();
      });

      it("fires validations when signers do not fill out the signature field", async () => {
        const page = await getPageHelper(
          { legalStructureId },
          { signers: [generateFormationSigner({ name: "" }, legalStructureId)] }
        );
        await attemptApiSubmission(page);
        const signerErrorText = () => {
          return screen.queryByText(Config.businessFormationDefaults.signerNameErrorText, { exact: false });
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
        const signerCheckboxErrorText = () => {
          return screen.queryByText(Config.businessFormationDefaults.signerCheckboxErrorText, {
            exact: false,
          });
        };
        expect(signerCheckboxErrorText()).toBeInTheDocument();
        page.selectCheckbox(`${Config.businessFormationDefaults.signatureColumnLabel}*`);
        expect(signerCheckboxErrorText()).not.toBeInTheDocument();
        await page.submitContactsStep();
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

          expect(
            screen.getByText(Config.businessFormationDefaults.signerTitlePlaceholder)
          ).toBeInTheDocument();

          await attemptApiSubmission(page);
          const signerTypeErrorText = () => {
            return screen.queryByText(Config.businessFormationDefaults.signerTypeErrorText, {
              exact: false,
            });
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
          expect(
            screen.getByText(Config.businessFormationDefaults.signerTitlePlaceholder)
          ).toBeInTheDocument();

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
          expect(currentUserData().formationData.formationFormData.signers).toEqual(signers);
        });
      });
    });
  });

  const attemptApiSubmission = async (page: FormationPageHelpers) => {
    await page.stepperClickToReviewStep();
    await page.clickSubmit();
    await page.stepperClickToContactsStep();
  };
});
