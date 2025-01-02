/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getPageHelper } from "@/components/tasks/business-formation/contacts/testHelpers";

import { getMergedConfig } from "@/contexts/configContext";
import { templateEval } from "@/lib/utils/helpers";
import { generateStateItem } from "@/test/factories";
import { FormationPageHelpers, setDesktopScreen, useSetupInitialMocks } from "@/test/helpers/helpers-formation";
import { currentBusiness } from "@/test/mock/withStatefulUserData";
import {
  FormationLegalType,
  FormationMember,
  generateFormationMember,
  generateFormationUSAddress,
  generateMunicipality
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { fireEvent, screen, waitFor } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...vi.requireActual("@mui/material"),
    useMediaQuery: vi.fn(),
  };
}

const Config = getMergedConfig();

vi.mock("@mui/material", () => mockMaterialUI());
vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));
vi.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: vi.fn() }));
vi.mock("@/lib/data-hooks/useDocuments");
vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));
vi.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: vi.fn(),
  getCompletedFiling: vi.fn(),
  searchBusinessName: vi.fn(),
}));

describe("Formation - Members Field", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useSetupInitialMocks();
  });

  const legalStructureIds: FormationLegalType[] = ["limited-liability-company", "s-corporation"];

  describe(`shared behaviors`, () => {
    legalStructureIds.map((legalStructureId) => {
      const configField = legalStructureId === "limited-liability-company" ? "members" : "directors";
      const nextButtonText = Config.formation.fields[configField].addButtonText;
      const successBodyText = Config.formation.fields[configField].successSnackbarBody;

      describe(`for ${legalStructureId}`, () => {
        const fillForm = (page: FormationPageHelpers, member: FormationMember): void => {
          page.fillText("Address name", member.name);
          page.fillText("Address line1", member.addressLine1);
          page.fillText("Address line2", member.addressLine2);
          page.fillText("Address city", member.addressCity!);
          page.fillText("Address state", member.addressState!.shortCode);
          page.fillText("Address zip code", member.addressZipCode);
        };

        it("does not show members section for foreign legal structures", async () => {
          await getPageHelper({ businessPersona: "FOREIGN", legalStructureId }, {});
          expect(screen.queryByTestId("addresses-members")).not.toBeInTheDocument();
        });

        it("edits members", async () => {
          const members = [...Array(2)].map(() => {
            return generateFormationMember({});
          });
          const page = await getPageHelper({ legalStructureId }, { members });

          expect(screen.getByText(nextButtonText, { exact: false })).toBeInTheDocument();
          const nameTd = screen.getByText(members[1].name, { exact: false });
          expect(nameTd).toBeInTheDocument();
          expect(
            screen.getByText(
              `${members[1].addressLine1}, ${members[1].addressLine2}, ${members[1].addressCity}, ${members[1].addressState?.name} ${members[1].addressZipCode}`,
              { exact: false }
            )
          ).toBeInTheDocument();
          // eslint-disable-next-line testing-library/no-node-access
          fireEvent.click(nameTd.parentElement?.querySelector('button[aria-label="edit"]') as Element);
          expect(page.getInputElementByLabel("Address name").value).toBe(members[1].name);
          expect(page.getInputElementByLabel("Address line1").value).toBe(members[1].addressLine1);
          expect(page.getInputElementByLabel("Address line2").value).toBe(members[1].addressLine2);
          expect(page.getInputElementByLabel("Address city").value).toBe(members[1].addressCity);
          expect(page.getInputElementByLabel("Address state").value).toBe(members[1].addressState?.shortCode);
          expect(page.getInputElementByLabel("Address zip code").value).toBe(members[1].addressZipCode);
          const newName = "Marie Smith";
          page.fillText("Address name", newName);
          page.clickAddressSubmit();
          await waitFor(() => {
            expect(screen.getByText(successBodyText, { exact: false })).toBeInTheDocument();
          });
          expect(screen.getByText(newName, { exact: false })).toBeInTheDocument();
          await page.submitContactsStep();
          const newMembers = currentBusiness().formationData.formationFormData.members;
          expect(newMembers?.length).toEqual(2);
          expect(
            newMembers?.findIndex((member) => {
              return member.name === newName;
            })
          ).toEqual(1);
        });

        it("is able to delete members", async () => {
          const members = [...Array(2)].map(() => {
            return generateFormationMember({});
          });
          const page = await getPageHelper({ legalStructureId }, { members });

          const nameTd = screen.getByText(members[1].name, { exact: false });
          expect(nameTd).toBeInTheDocument();
          // eslint-disable-next-line testing-library/no-node-access
          fireEvent.click(nameTd.parentElement?.querySelector('button[aria-label="delete"]') as Element);
          await page.submitContactsStep();
          const newMembers = currentBusiness().formationData.formationFormData.members;
          expect(newMembers?.length).toEqual(1);
          expect(
            newMembers?.find((member) => {
              return member === members[1];
            })
          ).toBeFalsy();
        });

        it("shows validation on submit", async () => {
          const page = await getPageHelper({ legalStructureId }, {});
          await page.openAddressModal("members");
          page.clickAddressSubmit();

          const { name, addressLine1, addressCity, addressState, addressZipCode } =
            Config.formation.addressModal;

          expect(screen.getByText(name.error)).toBeInTheDocument();
          expect(screen.getByText(addressLine1.error)).toBeInTheDocument();
          expect(screen.getByText(addressCity.error)).toBeInTheDocument();
          expect(screen.getByText(addressState.error)).toBeInTheDocument();
          expect(screen.getByText(addressZipCode.error)).toBeInTheDocument();
          await page.fillAddressModal({});
          expect(screen.queryByText(name.error)).not.toBeInTheDocument();
          expect(screen.queryByText(addressLine1.error)).not.toBeInTheDocument();
          expect(screen.queryByText(addressCity.error)).not.toBeInTheDocument();
          expect(screen.queryByText(addressState.error)).not.toBeInTheDocument();
          expect(screen.queryByText(addressZipCode.error)).not.toBeInTheDocument();
          page.clickAddressSubmit();
          await waitFor(() => {
            expect(screen.getByText(successBodyText, { exact: false })).toBeInTheDocument();
          });
        });

        it("shows maximum length validation for address and city fields on submit", async () => {
          const page = await getPageHelper({ legalStructureId }, {});
          await page.openAddressModal("members");
          await page.fillAddressModal({
            addressLine1: Array(36).fill("A").join(""),
            addressLine2: Array(36).fill("A").join(""),
            addressCity: Array(31).fill("A").join(""),
            addressState: generateStateItem(),
            addressZipCode: "08100",
          });
          page.clickAddressSubmit();

          const maxLengthMessage = (
            modalField: keyof typeof Config.formation.addressModal,
            len: string
          ): string =>
            templateEval(Config.formation.general.maximumLengthErrorText, {
              field: Config.formation.addressModal[modalField].label,
              maxLen: len,
            });

          expect(screen.getByText(maxLengthMessage("addressLine1", "35"))).toBeInTheDocument();
          expect(screen.getByText(maxLengthMessage("addressLine2", "35"))).toBeInTheDocument();
          expect(screen.getByText(maxLengthMessage("addressCity", "30"))).toBeInTheDocument();

          await page.fillAddressModal({
            addressLine1: Array(35).fill("A").join(""),
            addressLine2: Array(35).fill("A").join(""),
            addressCity: Array(30).fill("A").join(""),
            addressState: generateStateItem(),
            addressZipCode: "08100",
          });
          expect(screen.queryByText(maxLengthMessage("addressLine1", "35"))).not.toBeInTheDocument();
          expect(screen.queryByText(maxLengthMessage("addressLine2", "35"))).not.toBeInTheDocument();
          expect(screen.queryByText(maxLengthMessage("addressCity", "30"))).not.toBeInTheDocument();

          page.clickAddressSubmit();
          await waitFor(() => {
            expect(screen.getByText(successBodyText, { exact: false })).toBeInTheDocument();
          });
        });

        it("resets form on cancel", async () => {
          const page = await getPageHelper({ legalStructureId }, {});
          await page.openAddressModal("members");

          fillForm(page, generateFormationMember({ name: "Lincoln" }));
          fireEvent.click(screen.getByText(Config.formation.general.backButtonText));
          await waitFor(() => {
            return expect(
              screen.queryByText(Config.formation.general.backButtonText)
            ).not.toBeInTheDocument();
          });
          await page.openAddressModal("members");
          expect(page.getInputElementByLabel("Address name").value).toBe("");
        });

        it("does not add more than 10 members", async () => {
          const nineMembers = Array(9).fill(generateFormationMember({}));
          const page = await getPageHelper(
            { legalStructureId },
            {
              members: nineMembers,
            }
          );

          expect(screen.getByText(nextButtonText, { exact: false })).toBeInTheDocument();

          await page.openAddressModal("members");
          fillForm(page, generateFormationMember({ name: "Lincoln" }));
          page.clickAddressSubmit();

          await waitFor(() => {
            return expect(
              screen.queryByText(Config.formation.general.backButtonText)
            ).not.toBeInTheDocument();
          });
          expect(screen.queryByText(nextButtonText, { exact: false })).not.toBeInTheDocument();
          await page.submitContactsStep();
          expect(currentBusiness().formationData.formationFormData.members?.length).toEqual(10);
        });

        it("renders mobile view of members table", async () => {
          setDesktopScreen(false);
          const page = await getPageHelper({ legalStructureId }, { members: [] });
          await page.fillAndSubmitAddressModal({}, "members");
          expect(screen.getByTestId("addresses-members-table-mobile")).toBeInTheDocument();
        });
      });
    });

    describe(`default address checkbox`, () => {
      const legalStructureId = "limited-liability-company";

      it("adds members using business data using checkbox with name when no members exist", async () => {
        const page = await getPageHelper(
          {
            legalStructureId,
          },
          {
            members: [],
            contactFirstName: "John",
            contactLastName: "Smith",
            addressLine1: "123 Address",
            addressLine2: "business suite 201",
            addressMunicipality: generateMunicipality({
              displayName: "Hampton Borough",
              name: "Hampton",
              ...generateFormationUSAddress({}),
            }),

            addressCountry: "US",
            addressState: { shortCode: "NJ", name: "New Jersey" },
            addressZipCode: "07601",
          }
        );
        await page.openAddressModal("members");

        page.selectCheckbox(Config.formation.fields.members.addressCheckboxText);
        expect(page.getInputElementByLabel("Address name").value).toBe("John Smith");
        expect(page.getInputElementByLabel("Address line1").value).toBe("123 Address");
        expect(page.getInputElementByLabel("Address line2").value).toBe("business suite 201");
        expect(page.getInputElementByLabel("Address city").value).toBe("Hampton");
        expect(page.getInputElementByLabel("Address state").value).toBe("NJ");
        expect(page.getInputElementByLabel("Address zip code").value).toBe("07601");
      });

      it("adds members using business data using checkbox without name when some members already exist", async () => {
        const page = await getPageHelper(
          {
            legalStructureId,
          },
          {
            members: [generateFormationMember({})],
            contactFirstName: "John",
            contactLastName: "Smith",
            addressLine1: "123 Address",
            addressLine2: "business suite 201",
            addressMunicipality: generateMunicipality({ displayName: "Hampton Borough", name: "Hampton" }),
            addressCountry: "US",
            addressState: { shortCode: "NJ", name: "New Jersey" },
            addressZipCode: "07601",
          }
        );
        await page.openAddressModal("members");

        page.selectCheckbox(Config.formation.fields.members.addressCheckboxText);
        expect(page.getInputElementByLabel("Address name").value).toBe("");
        expect(page.getInputElementByLabel("Address line1").value).toBe("123 Address");
        expect(page.getInputElementByLabel("Address line2").value).toBe("business suite 201");
        expect(page.getInputElementByLabel("Address city").value).toBe("Hampton");
        expect(page.getInputElementByLabel("Address state").value).toBe("NJ");
        expect(page.getInputElementByLabel("Address zip code").value).toBe("07601");
      });

      it("saves and displays municipality name, not displayName on checkbox import", async () => {
        const page = await getPageHelper(
          {
            legalStructureId,
          },
          {
            members: [],
            contactFirstName: "John",
            contactLastName: "Smith",
            addressLine1: "123 Address",
            addressLine2: "business suite 201",
            addressMunicipality: generateMunicipality({
              displayName: "Hampton Borough",
              name: "Hampton",
              ...generateFormationUSAddress({}),
            }),

            addressCountry: "US",
            addressState: { shortCode: "NJ", name: "New Jersey" },
            addressZipCode: "07601",
          }
        );
        await page.openAddressModal("members");

        page.selectCheckbox(Config.formation.fields.members.addressCheckboxText);
        expect(page.getInputElementByLabel("Address city").value).toBe("Hampton");

        page.clickAddressSubmit();
        await waitFor(() => {
          expect(screen.getByText(Config.formation.fields.members.successSnackbarBody)).toBeInTheDocument();
        });
        await page.submitContactsStep();
        const newMembers = currentBusiness().formationData.formationFormData.members!;
        expect(newMembers.length).toEqual(1);
        expect(newMembers[0].addressCity).toEqual("Hampton");
      });

      it("only fills & disables required fields with values when checkbox checked", async () => {
        const page = await getPageHelper(
          {
            legalStructureId,
            municipality: generateMunicipality({ displayName: "Hampton Borough", name: "Hampton" }),
          },
          {
            members: [],
            addressLine1: "123 Address",
            addressLine2: "",
            addressZipCode: "",
          }
        );
        await page.openAddressModal("members");

        page.selectCheckbox(Config.formation.fields.members.addressCheckboxText);
        expect(page.getInputElementByLabel("Address line1").value).toBe("123 Address");
        expect(page.getInputElementByLabel("Address line2").value).toBe("");
        expect(page.getInputElementByLabel("Address zip code").value).toBe("");
        expect(page.getInputElementByLabel("Address line1").disabled).toBe(true);
        expect(page.getInputElementByLabel("Address line2").disabled).toEqual(true);
        expect(page.getInputElementByLabel("Address zip code").disabled).toEqual(false);
      });

      it("shows inline validation for missing fields with checkbox", async () => {
        const page = await getPageHelper(
          {
            legalStructureId,
          },
          {
            members: [],
            addressLine1: "",
          }
        );
        await page.openAddressModal("members");

        page.selectCheckbox(Config.formation.fields.members.addressCheckboxText);
        expect(screen.getByText(Config.formation.addressModal.addressLine1.error)).toBeInTheDocument();
      });

      it("unselects checkbox when interacting with non-disabled fields", async () => {
        const page = await getPageHelper(
          {
            legalStructureId,
          },
          {
            members: [],
            addressLine1: "123 Address",
            addressLine2: "",
            addressZipCode: "",
          }
        );
        await page.openAddressModal("members");

        page.selectCheckbox(Config.formation.fields.members.addressCheckboxText);
        expect(
          page.getInputElementByLabel(Config.formation.fields.members.addressCheckboxText).checked
        ).toEqual(true);
        page.fillText("Address zip code", "12345");
        expect(
          page.getInputElementByLabel(Config.formation.fields.members.addressCheckboxText).checked
        ).toEqual(false);
        expect(page.getInputElementByLabel("Address line1").disabled).toBe(false);
        expect(page.getInputElementByLabel("Address line2").disabled).toEqual(false);
        expect(page.getInputElementByLabel("Address city").disabled).toBe(false);
        expect(page.getInputElementByLabel("Address state").disabled).toBe(false);
        expect(page.getInputElementByLabel("Address zip code").disabled).toEqual(false);
      });
    });
  });

  describe("s-corp and c-corp", () => {
    const legalStructures = ["c-corporation", "s-corporation"];
    for (const legalStructureId of legalStructures) {
      it(`requires directors for ${legalStructureId}`, async () => {
        const page = await getPageHelper({ legalStructureId }, { members: [] });
        await attemptApiSubmission(page);
        expect(screen.getByText(Config.formation.fields.directors.error)).toBeInTheDocument();
      });

      it(`displays directors content for ${legalStructureId}`, async () => {
        const page = await getPageHelper({ legalStructureId }, { members: [] });
        await page.stepperClickToContactsStep();
        expect(screen.getByText(Config.formation.fields.directors.label)).toBeInTheDocument();
        expect(screen.queryByText(Config.formation.fields.members.label)).not.toBeInTheDocument();
      });
    }
  });

  describe("non-corp members legal structures", () => {
    const legalStructures = ["limited-liability-company"];
    for (const legalStructureId of legalStructures) {
      it(`does not require members for ${legalStructureId}`, async () => {
        const page = await getPageHelper({ legalStructureId }, { members: [], signers: [] });
        await attemptApiSubmission(page);
        expect(screen.queryByText(Config.formation.fields.directors.error)).not.toBeInTheDocument();
      });

      it(`displays members content for ${legalStructureId}`, async () => {
        const page = await getPageHelper({ legalStructureId }, { members: [] });
        await page.stepperClickToContactsStep();
        expect(screen.getByText(Config.formation.fields.members.label)).toBeInTheDocument();
        expect(screen.getByText(Config.formation.fields.members.subheader)).toBeInTheDocument();
        expect(screen.queryByText(Config.formation.fields.directors.label)).not.toBeInTheDocument();
      });
    }
  });

  const attemptApiSubmission = async (page: FormationPageHelpers): Promise<void> => {
    await page.stepperClickToReviewStep();
    await page.clickSubmit();
    await page.stepperClickToContactsStep();
  };
});
