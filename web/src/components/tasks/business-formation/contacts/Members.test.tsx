/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getPageHelper } from "@/components/tasks/business-formation/contacts/testHelpers";

import {
  FormationPageHelpers,
  setDesktopScreen,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import { currentUserData } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  FormationLegalType,
  FormationMember,
  generateFormationMember,
  generateFormationUSAddress,
  generateMunicipality,
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { fireEvent, screen, waitFor } from "@testing-library/react";

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

describe("Formation - Members Field", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const legalStructureIds: FormationLegalType[] = ["limited-liability-company", "s-corporation"];

  describe(`shared behaviors`, () => {
    legalStructureIds.map((legalStructureId) => {
      const nextButtonText =
        legalStructureId == "limited-liability-company"
          ? Config.businessFormationDefaults.membersNewButtonText
          : Config.businessFormationDefaults.directorsNewButtonText;

      const successBodyText =
        legalStructureId == "limited-liability-company"
          ? Config.businessFormationDefaults.membersSuccessTextBody
          : Config.businessFormationDefaults.directorsSuccessTextBody;

      describe(`for ${legalStructureId}`, () => {
        const fillForm = (page: FormationPageHelpers, member: FormationMember) => {
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
          const newName = "Joe Biden";
          page.fillText("Address name", newName);
          page.clickAddressSubmit();
          await waitFor(() => {
            expect(screen.getByText(successBodyText, { exact: false })).toBeInTheDocument();
          });
          expect(screen.getByText(newName, { exact: false })).toBeInTheDocument();
          await page.submitContactsStep();
          const newMembers = currentUserData().formationData.formationFormData.members;
          expect(newMembers?.length).toEqual(2);
          expect(
            newMembers?.findIndex((member) => {
              return member.name == newName;
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
          const newMembers = currentUserData().formationData.formationFormData.members;
          expect(newMembers?.length).toEqual(1);
          expect(
            newMembers?.find((member) => {
              return member == members[1];
            })
          ).toBeFalsy();
        });

        it("shows validation on submit", async () => {
          const page = await getPageHelper({ legalStructureId }, {});
          await page.openAddressModal("members");
          page.clickAddressSubmit();

          expect(
            screen.getByText(Config.businessFormationDefaults.nameErrorText, { exact: false })
          ).toBeInTheDocument();
          expect(
            screen.getByText(Config.businessFormationDefaults.addressErrorText, { exact: false })
          ).toBeInTheDocument();
          expect(
            screen.getByText(Config.businessFormationDefaults.addressCityErrorText, { exact: false })
          ).toBeInTheDocument();
          expect(
            screen.getByText(Config.businessFormationDefaults.addressStateErrorText, { exact: false })
          ).toBeInTheDocument();
          expect(
            screen.getByText(Config.businessFormationDefaults.addressModalZipCodeErrorText, {
              exact: false,
            })
          ).toBeInTheDocument();
          await page.fillAddressModal({});
          expect(
            screen.queryByText(Config.businessFormationDefaults.nameErrorText, { exact: false })
          ).not.toBeInTheDocument();
          expect(
            screen.queryByText(Config.businessFormationDefaults.addressErrorText, { exact: false })
          ).not.toBeInTheDocument();
          expect(
            screen.queryByText(Config.businessFormationDefaults.addressCityErrorText, { exact: false })
          ).not.toBeInTheDocument();
          expect(
            screen.queryByText(Config.businessFormationDefaults.addressStateErrorText, { exact: false })
          ).not.toBeInTheDocument();
          expect(
            screen.queryByText(Config.businessFormationDefaults.addressModalZipCodeErrorText, {
              exact: false,
            })
          ).not.toBeInTheDocument();
          page.clickAddressSubmit();
          await waitFor(() => {
            expect(screen.getByText(successBodyText, { exact: false })).toBeInTheDocument();
          });
        });

        it("resets form on cancel", async () => {
          const page = await getPageHelper({ legalStructureId }, {});
          await page.openAddressModal("members");

          fillForm(page, generateFormationMember({ name: "Lincoln" }));
          fireEvent.click(screen.getByText(Config.businessFormationDefaults.addressModalBackButtonText));
          await waitFor(() => {
            return expect(
              screen.queryByText(Config.businessFormationDefaults.addressModalBackButtonText)
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
              screen.queryByText(Config.businessFormationDefaults.addressModalBackButtonText)
            ).not.toBeInTheDocument();
          });
          expect(screen.queryByText(nextButtonText, { exact: false })).not.toBeInTheDocument();
          await page.submitContactsStep();
          expect(currentUserData().formationData.formationFormData.members?.length).toEqual(10);
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

      it("adds members using business data using checkbox with name", async () => {
        const page = await getPageHelper(
          {
            legalStructureId,
            municipality: generateMunicipality({
              displayName: "Hampton Borough",
              name: "Hampton",
              ...generateFormationUSAddress({}),
            }),
          },
          {
            members: [],
            contactFirstName: "John",
            contactLastName: "Smith",
            addressLine1: "123 Address",
            addressLine2: "business suite 201",
            addressCountry: "US",
            addressState: { shortCode: "NJ", name: "New Jersey" },
            addressZipCode: "07601",
          }
        );
        await page.openAddressModal("members");

        page.selectCheckbox(Config.businessFormationDefaults.membersCheckboxText);
        expect(page.getInputElementByLabel("Address name").value).toBe("John Smith");
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
            municipality: generateMunicipality({
              displayName: "Hampton Borough",
              name: "Hampton",
              ...generateFormationUSAddress({}),
            }),
          },
          {
            members: [],
            contactFirstName: "John",
            contactLastName: "Smith",
            addressLine1: "123 Address",
            addressLine2: "business suite 201",
            addressCountry: "US",
            addressState: { shortCode: "NJ", name: "New Jersey" },
            addressZipCode: "07601",
          }
        );
        await page.openAddressModal("members");

        page.selectCheckbox(Config.businessFormationDefaults.membersCheckboxText);
        expect(page.getInputElementByLabel("Address city").value).toBe("Hampton");

        page.clickAddressSubmit();
        await waitFor(() => {
          expect(
            screen.getByText(Config.businessFormationDefaults.membersSuccessTextBody, { exact: false })
          ).toBeInTheDocument();
        });
        await page.submitContactsStep();
        const newMembers = currentUserData().formationData.formationFormData.members!;
        expect(newMembers.length).toEqual(1);
        expect(newMembers[0].addressCity).toEqual("Hampton");
      });

      it("adds members using business data using checkbox without name", async () => {
        const page = await getPageHelper(
          {
            legalStructureId,
            municipality: generateMunicipality({ displayName: "Hampton Borough", name: "Hampton" }),
          },
          {
            members: [generateFormationMember({})],
            contactFirstName: "John",
            contactLastName: "Smith",
            addressLine1: "123 Address",
            addressLine2: "business suite 201",
            addressCountry: "US",
            addressState: { shortCode: "NJ", name: "New Jersey" },
            addressZipCode: "07601",
          }
        );
        await page.openAddressModal("members");

        page.selectCheckbox(Config.businessFormationDefaults.membersCheckboxText);
        expect(page.getInputElementByLabel("Address name").value).toBe("");
        expect(page.getInputElementByLabel("Address line1").value).toBe("123 Address");
        expect(page.getInputElementByLabel("Address line2").value).toBe("business suite 201");
        expect(page.getInputElementByLabel("Address city").value).toBe("Hampton");
        expect(page.getInputElementByLabel("Address state").value).toBe("NJ");
        expect(page.getInputElementByLabel("Address zip code").value).toBe("07601");
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

        page.selectCheckbox(Config.businessFormationDefaults.membersCheckboxText);
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

        page.selectCheckbox(Config.businessFormationDefaults.membersCheckboxText);
        expect(screen.getByText(Config.businessFormationDefaults.addressErrorText)).toBeInTheDocument();
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

        page.selectCheckbox(Config.businessFormationDefaults.membersCheckboxText);
        expect(
          page.getInputElementByLabel(Config.businessFormationDefaults.membersCheckboxText).checked
        ).toEqual(true);
        page.fillText("Address zip code", "12345");
        expect(
          page.getInputElementByLabel(Config.businessFormationDefaults.membersCheckboxText).checked
        ).toEqual(false);
        expect(page.getInputElementByLabel("Address line1").disabled).toBe(false);
        expect(page.getInputElementByLabel("Address line2").disabled).toEqual(false);
        expect(page.getInputElementByLabel("Address city").disabled).toBe(false);
        expect(page.getInputElementByLabel("Address state").disabled).toBe(false);
        expect(page.getInputElementByLabel("Address zip code").disabled).toEqual(false);
      });
    });
  });

  describe("required members (directors) for corporations", () => {
    it("fires validations when directors are empty", async () => {
      const page = await getPageHelper({ legalStructureId: "s-corporation" }, { members: [] });
      await attemptApiSubmission(page);
      expect(
        screen.getByText(Config.businessFormationDefaults.directorsMinimumErrorText)
      ).toBeInTheDocument();
    });

    const attemptApiSubmission = async (page: FormationPageHelpers) => {
      await page.stepperClickToReviewStep();
      await page.clickSubmit();
      await page.stepperClickToContactsStep();
    };
  });
});
