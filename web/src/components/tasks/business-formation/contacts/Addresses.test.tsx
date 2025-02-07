/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getPageHelper } from "@/components/tasks/business-formation/contacts/testHelpers";
import { getMergedConfig } from "@/contexts/configContext";
import { FormationPageHelpers, useSetupInitialMocks } from "@/test/helpers/helpers-formation";
import { currentBusiness } from "@/test/mock/withStatefulUserData";
import {
  FormationLegalType,
  generateFormationIncorporator,
  generateFormationUSAddress,
  generateMunicipality,
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
  searchBusinessName: jest.fn(),
}));

describe("Formation - Addresses", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  describe("addressed signer fields (incorporators)", () => {
    const legalStructureIds: FormationLegalType[] = ["limited-partnership", "s-corporation"];

    legalStructureIds.map((legalStructureId) =>
      describe(`for ${legalStructureId}`, () => {
        it("adds signer", async () => {
          const page = await getPageHelper({ legalStructureId }, { incorporators: [] });
          expect(screen.getByText(Config.formation.fields.incorporators.label)).toBeInTheDocument();
          page.clickAddNewIncorporator();
          const signer = generateFormationIncorporator(
            {
              ...generateFormationUSAddress({}),
            },
            legalStructureId
          );
          page.fillText("Address name", signer.name);
          page.fillText("Address line1", signer.addressLine1);
          page.fillText("Address line2", signer.addressLine2);
          page.fillText("Address city", signer.addressCity ?? "");
          page.fillText("Address state", signer.addressState!.name);
          page.fillText("Address zip code", signer.addressZipCode);
          page.clickAddressSubmit();
          page.checkSignerBox(0, "incorporators");
          await page.submitContactsStep();
          expect(currentBusiness().formationData.formationFormData.incorporators).toEqual([
            { ...signer, signature: true, title: signer.title },
          ]);
        });

        it("edits signer", async () => {
          const incorporators = [
            generateFormationIncorporator(
              {
                signature: true,
                ...generateFormationUSAddress({}),
              },
              legalStructureId
            ),
            generateFormationIncorporator(
              {
                signature: true,
                title: "Incorporator",
                ...generateFormationUSAddress({}),
              },
              legalStructureId
            ),
          ];
          const page = await getPageHelper({ legalStructureId }, { incorporators });
          const nameTd = screen.getByText(incorporators[1].name, { exact: false });
          expect(nameTd).toBeInTheDocument();
          expect(
            screen.getByText(
              `${incorporators[1].addressLine1}, ${incorporators[1].addressLine2}, ${incorporators[1].addressCity}, ${incorporators[1].addressState?.name} ${incorporators[1].addressZipCode}`,
              { exact: false }
            )
          ).toBeInTheDocument();

          // eslint-disable-next-line testing-library/no-node-access
          const tr = nameTd.closest("tr");

          if (tr !== null) {
            const editButton = within(tr).getByRole("button", {
              name: Config.formation.fields.signers.editLabel,
            });
            await userEvent.click(editButton);
          }

          expect(page.getInputElementByLabel("Address name").value).toBe(incorporators[1].name);
          expect(page.getInputElementByLabel("Address line1").value).toBe(incorporators[1].addressLine1);
          expect(page.getInputElementByLabel("Address line2").value).toBe(incorporators[1].addressLine2);
          expect(page.getInputElementByLabel("Address city").value).toBe(incorporators[1].addressCity);
          expect(page.getInputElementByLabel("Address state").value).toBe(
            incorporators[1].addressState?.shortCode
          );
          expect(page.getInputElementByLabel("Address zip code").value).toBe(incorporators[1].addressZipCode);
          const newName = "Luke Potter";
          page.fillText("Address name", newName);
          page.clickAddressSubmit();
          await waitFor(() => {
            expect(
              screen.getByText(Config.formation.fields.incorporators.successSnackbarBody)
            ).toBeInTheDocument();
          });
          expect(screen.getByText(newName, { exact: false })).toBeInTheDocument();
          await page.submitContactsStep();
          const newIncorporators = currentBusiness().formationData.formationFormData.incorporators;
          expect(newIncorporators?.length).toEqual(2);
          expect(
            newIncorporators?.findIndex((signer) => {
              return signer.name === newName;
            })
          ).toEqual(1);
        });

        it("deletes an additional signer", async () => {
          const incorporators = [
            generateFormationIncorporator(
              {
                signature: true,
                title: "Incorporator",
                ...generateFormationUSAddress({}),
              },
              legalStructureId
            ),
            generateFormationIncorporator(
              {
                signature: true,
                title: "Incorporator",
                ...generateFormationUSAddress({}),
              },
              legalStructureId
            ),
          ];
          const page = await getPageHelper({ legalStructureId }, { incorporators });
          const nameTd = screen.getByText(incorporators[1].name, { exact: false });

          // eslint-disable-next-line testing-library/no-node-access
          const tr = nameTd.closest("tr");

          if (tr !== null) {
            const removeButton = within(tr).getByRole("button", {
              name: Config.formation.fields.signers.deleteLabel,
            });
            await userEvent.click(removeButton);
          }

          await page.submitContactsStep();
          expect(currentBusiness().formationData.formationFormData.incorporators).toEqual([incorporators[0]]);
        });

        it("does not allow more than 10 signers", async () => {
          const incorporators = Array(10).fill(
            generateFormationIncorporator(
              {
                signature: true,
                ...generateFormationUSAddress({}),
              },
              legalStructureId
            )
          );
          await getPageHelper({ legalStructureId }, { incorporators });
          expect(screen.queryByText(Config.formation.fields.signers.addButtonText)).not.toBeInTheDocument();
        });

        it("fires validations when signers do not fill out all the fields", async () => {
          const incorporators = [
            generateFormationIncorporator(
              {
                name: "",
                ...generateFormationUSAddress({}),
              },
              legalStructureId
            ),
          ];
          const page = await getPageHelper({ legalStructureId }, { incorporators });
          await attemptApiSubmission(page);

          const signerErrorText = (): HTMLElement | null => {
            return screen.queryByText(Config.formation.fields.signers.errorBannerCheckbox);
          };
          expect(signerErrorText()).toBeInTheDocument();
          const nameTd = screen.getByText(incorporators[0].addressLine1, { exact: false });

          // eslint-disable-next-line testing-library/no-node-access
          const tr = nameTd.closest("tr");

          if (tr !== null) {
            const editButton = within(tr).getByRole("button", {
              name: Config.formation.fields.signers.editLabel,
            });
            await userEvent.click(editButton);
          }
          page.fillText("Address name", "Elrond");
          page.clickAddressSubmit();
          expect(signerErrorText()).toBeInTheDocument();
        });

        it("fires validations when signers do not check the sign checkbox", async () => {
          const incorporators = [generateFormationIncorporator({}, legalStructureId)];
          const page = await getPageHelper({ legalStructureId }, { incorporators });
          await attemptApiSubmission(page);
          const signerCheckboxErrorText = (): HTMLElement | null => {
            return screen.queryByText(Config.formation.fields.signers.errorBannerCheckbox);
          };
          expect(signerCheckboxErrorText()).toBeInTheDocument();
          page.checkSignerBox(0, "incorporators");
          expect(signerCheckboxErrorText()).not.toBeInTheDocument();
          await page.submitContactsStep();
        });
      })
    );

    describe("default checkbox behavior", () => {
      it("adds signer address using business data via checkbox", async () => {
        const page = await getPageHelper(
          {
            legalStructureId: "limited-partnership",
          },
          {
            contactFirstName: "John",
            contactLastName: "Smith",
            addressLine1: "123 Address",
            addressLine2: "business suite 201",
            addressMunicipality: generateMunicipality({ displayName: "Hampton Borough", name: "Hampton" }),
            addressState: { shortCode: "NJ", name: "New Jersey" },
            addressZipCode: "07601",
          }
        );
        page.clickAddNewIncorporator();
        fireEvent.click(screen.getByTestId("default-checkbox"));
        expect(page.getInputElementByLabel("Address name").value).toBe("");
        expect(page.getInputElementByLabel("Address line1").value).toBe("123 Address");
        expect(page.getInputElementByLabel("Address line2").value).toBe("business suite 201");
        expect(page.getInputElementByLabel("Address city").value).toBe("Hampton");
        expect(page.getInputElementByLabel("Address state").value).toBe("NJ");
        expect(page.getInputElementByLabel("Address zip code").value).toBe("07601");
        page.fillText("Address name", "The Dude");
      });
    });
  });

  it("does not include US Territories in state dropdown for users starting a new business", async () => {
    const page = await getPageHelper({ legalStructureId: "limited-partnership" }, { incorporators: [] });
    page.clickAddNewIncorporator();

    const listBox = await page.getListBoxForInputElementByTestId("addressState");

    expect(within(listBox).getByText("NJ")).toBeInTheDocument();
    expect(within(listBox).queryByText("AS")).not.toBeInTheDocument();
    expect(within(listBox).queryByText("VI")).not.toBeInTheDocument();
    expect(within(listBox).queryByText("GU")).not.toBeInTheDocument();
  });

  const attemptApiSubmission = async (page: FormationPageHelpers): Promise<void> => {
    await page.stepperClickToReviewStep();
    await page.clickSubmit();
    await page.stepperClickToContactsStep();
  };
});
