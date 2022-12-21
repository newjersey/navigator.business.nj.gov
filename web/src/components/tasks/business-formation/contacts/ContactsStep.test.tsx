/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  generateFormationDbaContent,
  generateFormationDisplayContent,
  generateUser,
  generateUserData,
} from "@/test/factories";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  preparePage,
  setDesktopScreen,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import { currentUserData } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  BusinessUser,
  createEmptyFormationSigner,
  FormationFormData,
  FormationIncorporator,
  FormationLegalType,
  FormationMember,
  generateFormationFormData,
  generateFormationIncorporator,
  generateFormationMember,
  generateFormationSigner,
  generateFormationUSAddress,
  generateMunicipality,
  ProfileData,
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

describe("Formation - ContactsStep", () => {
  const displayContent = {
    formationDisplayContent: generateFormationDisplayContent({}),
    formationDbaContent: generateFormationDbaContent({}),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const getPageHelper = async (
    initialProfileData: Partial<ProfileData>,
    formationFormData: Partial<FormationFormData>,
    initialUser?: Partial<BusinessUser>
  ): Promise<FormationPageHelpers> => {
    const profileData = generateFormationProfileData(initialProfileData);
    const formationData = {
      formationFormData: generateFormationFormData(formationFormData, {
        legalStructureId: profileData.legalStructureId as FormationLegalType,
      }),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
    };
    const user = initialUser ? generateUser(initialUser) : generateUser({});
    const page = preparePage(
      generateUserData({
        profileData,
        formationData,
        user,
      }),
      displayContent
    );

    await page.fillAndSubmitBusinessNameStep();
    await page.submitBusinessStep();
    return page;
  };

  describe("when llp", () => {
    const legalStructureId: FormationLegalType = "limited-liability-partnership";

    it("auto-fills fields from userData if it exists", async () => {
      const formationFormData = generateFormationFormData(
        {
          members: [],
          signers: [
            generateFormationSigner({
              name: `signer 1`,
              signature: true,
            }),
            generateFormationSigner({
              name: `signer 2`,
              signature: true,
            }),
            generateFormationSigner({
              name: `signer 3`,
              signature: true,
            }),
          ],
        },
        { legalStructureId }
      );

      const page = await getPageHelper({ legalStructureId }, formationFormData);
      expect(screen.queryByTestId("addresses-members")).not.toBeInTheDocument();

      expect(page.getInputElementByLabel("Signer 0").value).toBe("signer 1");
      expect(page.getInputElementByLabel("Signer 1").value).toBe("signer 2");
      expect(page.getInputElementByLabel("Signer 2").value).toBe("signer 3");
    });
  });

  describe("when lp", () => {
    const legalStructureId = "limited-partnership";

    it("auto-fills fields from userData if it exists", async () => {
      const formationFormData = generateFormationFormData(
        {
          incorporators: [
            {
              name: "Donald Whatever",
              addressCity: "Miami",
              addressLine1: "160 Something Ave NW",
              addressLine2: "Office of Whatever",
              addressState: { name: "Florida", shortCode: "FL" },
              addressCountry: "US",
              addressZipCode: "20501",
              title: "General Partner",
              signature: true,
            },
            generateFormationIncorporator({
              signature: false,
              title: "General Partner",
              ...generateFormationUSAddress({}),
            }),
          ],
        },
        { legalStructureId }
      );

      const page = await getPageHelper({ legalStructureId }, formationFormData);

      expect(screen.queryByTestId("addresses-members")).not.toBeInTheDocument();

      expect(screen.getByTestId("addresses-incorporators")).toBeInTheDocument();

      expect(
        screen.queryByText(
          displayContent.formationDisplayContent[legalStructureId].members.placeholder as string
        )
      ).not.toBeInTheDocument();
      expect(screen.getByText("Donald Whatever")).toBeInTheDocument();
      expect(screen.getByText("160 Something Ave NW", { exact: false })).toBeInTheDocument();
      expect(screen.getByText("Office of Whatever", { exact: false })).toBeInTheDocument();
      expect(screen.getByText("Miami", { exact: false })).toBeInTheDocument();
      expect(screen.getByText("Florida", { exact: false })).toBeInTheDocument();
      expect(screen.getByText("20501", { exact: false })).toBeInTheDocument();
      expect(page.getSignerBox(0, "incorporators")).toEqual(true);
    });

    it("adds incorporators address using business data via checkbox", async () => {
      const page = await getPageHelper(
        {
          legalStructureId,
          municipality: generateMunicipality({ displayName: "Hampton Borough", name: "Hampton" }),
        },
        {
          contactFirstName: "John",
          contactLastName: "Smith",
          addressLine1: "123 Address",
          addressLine2: "business suite 201",
          addressState: { shortCode: "NJ", name: "New Jersey" },
          addressZipCode: "07601",
        }
      );
      page.clickAddNewSigner();
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

  describe("when corp", () => {
    const legalStructureId = "s-corporation";

    it("auto-fills fields from userData if it exists", async () => {
      const members: FormationMember[] = [
        {
          name: "Joe Biden",
          addressCity: "Washington",
          addressLine1: "1600 Pennsylvania Ave NW",
          addressLine2: "Office of the President",
          addressState: { name: "District of Columbia", shortCode: "DC" },
          addressCountry: "US",
          addressZipCode: "20500",
        },
      ];
      const incorporators: FormationIncorporator[] = [
        {
          name: "Donald Whatever",
          addressCity: "Miami",
          addressLine1: "160 Something Ave NW",
          addressLine2: "Office of Whatever",
          addressState: { name: "Florida", shortCode: "FL" },
          addressCountry: "US",
          addressZipCode: "20501",
          title: "Incorporator",
          signature: true,
        },
      ];
      const formationFormData = generateFormationFormData(
        {
          members,
          incorporators,
        },
        { legalStructureId }
      );

      const page = await getPageHelper({ legalStructureId }, formationFormData);

      expect(screen.getByTestId("addresses-members")).toBeInTheDocument();
      expect(
        screen.queryByText(
          displayContent.formationDisplayContent[legalStructureId].members.placeholder as string
        )
      ).not.toBeInTheDocument();
      expect(screen.getByText(members[0].name)).toBeInTheDocument();
      expect(screen.getByText(members[0].addressLine1, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressLine2, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressCity as string, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressState!.name, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressZipCode, { exact: false })).toBeInTheDocument();

      expect(screen.getByTestId("addresses-incorporators")).toBeInTheDocument();
      expect(
        screen.queryByText(
          displayContent.formationDisplayContent[legalStructureId].members.placeholder as string
        )
      ).not.toBeInTheDocument();
      expect(screen.getByText(incorporators[0].name)).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressLine1, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressLine2, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressCity as string, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressState!.name, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(incorporators[0].addressZipCode, { exact: false })).toBeInTheDocument();
      expect(page.getSignerBox(0, "incorporators")).toEqual(true);
    });

    it("edits directors", async () => {
      const members = [generateFormationMember({}), generateFormationMember({})];
      const page = await getPageHelper({ legalStructureId }, { members, incorporators: [] });

      expect(
        screen.getByText(Config.businessFormationDefaults.directorsNewButtonText, { exact: false })
      ).toBeInTheDocument();
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
      expect(page.getInputElementByLabel("Address state").value).toBe(
        members[1].addressState?.shortCode ?? ""
      );
      expect(page.getInputElementByLabel("Address zip code").value).toBe(members[1].addressZipCode);
      const newName = "John Biden";
      page.fillText("Address name", newName);
      page.clickAddressSubmit();
      await waitFor(() => {
        expect(
          screen.getByText(Config.businessFormationDefaults.directorsSuccessTextBody, { exact: false })
        ).toBeInTheDocument();
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

    it("fires validations when directors are empty", async () => {
      const page = await getPageHelper({ legalStructureId }, { members: [] });
      await attemptApiSubmission(page);
      expect(
        screen.getByText(Config.businessFormationDefaults.directorsMinimumErrorText)
      ).toBeInTheDocument();
    });

    describe(`incorporators for ${legalStructureId}`, () => {
      it("adds incorporator", async () => {
        const page = await getPageHelper({ legalStructureId }, { incorporators: [] });
        expect(
          screen.getByText(
            displayContent.formationDisplayContent[legalStructureId].signatureHeader.placeholder as string
          )
        ).toBeInTheDocument();
        page.clickAddNewSigner();
        const signer = generateFormationIncorporator({
          title: "Incorporator",
          ...generateFormationUSAddress({}),
        });
        page.fillText("Address name", signer.name);
        page.fillText("Address line1", signer.addressLine1);
        page.fillText("Address line2", signer.addressLine2);
        page.fillText("Address city", signer.addressCity ?? "");
        page.fillText("Address state", signer.addressState!.name);
        page.fillText("Address zip code", signer.addressZipCode);
        page.clickAddressSubmit();
        page.checkSignerBox(0, "incorporators");
        await page.submitContactsStep();
        expect(currentUserData().formationData.formationFormData.incorporators).toEqual([
          { ...signer, signature: true },
        ]);
      });

      it("edits incorporators", async () => {
        const incorporators = [
          generateFormationIncorporator({
            signature: true,
            title: "Incorporator",
            ...generateFormationUSAddress({}),
          }),
          generateFormationIncorporator({
            signature: true,
            title: "Incorporator",
            ...generateFormationUSAddress({}),
          }),
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
        fireEvent.click(nameTd.parentElement?.querySelector('button[aria-label="edit"]') as Element);
        expect(page.getInputElementByLabel("Address name").value).toBe(incorporators[1].name);
        expect(page.getInputElementByLabel("Address line1").value).toBe(incorporators[1].addressLine1);
        expect(page.getInputElementByLabel("Address line2").value).toBe(incorporators[1].addressLine2);
        expect(page.getInputElementByLabel("Address city").value).toBe(incorporators[1].addressCity);
        expect(page.getInputElementByLabel("Address state").value).toBe(
          incorporators[1].addressState?.shortCode
        );
        expect(page.getInputElementByLabel("Address zip code").value).toBe(incorporators[1].addressZipCode);
        const newName = "Joe Biden";
        page.fillText("Address name", newName);
        page.clickAddressSubmit();
        await waitFor(() => {
          expect(
            screen.getByText(Config.businessFormationDefaults.incorporatorsSuccessTextBody, { exact: false })
          ).toBeInTheDocument();
        });
        expect(screen.getByText(newName, { exact: false })).toBeInTheDocument();
        await page.submitContactsStep();
        const newIncorporators = currentUserData().formationData.formationFormData.incorporators;
        expect(newIncorporators?.length).toEqual(2);
        expect(
          newIncorporators?.findIndex((signer) => {
            return signer.name == newName;
          })
        ).toEqual(1);
      });

      it("deletes an additional signer", async () => {
        const incorporators = [
          generateFormationIncorporator({
            signature: true,
            title: "Incorporator",
            ...generateFormationUSAddress({}),
          }),
          generateFormationIncorporator({
            signature: true,
            title: "Incorporator",
            ...generateFormationUSAddress({}),
          }),
        ];
        const page = await getPageHelper({ legalStructureId }, { incorporators });
        const nameTd = screen.getByText(incorporators[1].name, { exact: false });
        // eslint-disable-next-line testing-library/no-node-access
        fireEvent.click(nameTd.parentElement?.querySelector('button[aria-label="delete"]') as Element);
        await page.submitContactsStep();
        expect(currentUserData().formationData.formationFormData.incorporators).toEqual([incorporators[0]]);
      });

      it("does not allow more than 10 incorporators", async () => {
        const incorporators = Array(10).fill(
          generateFormationIncorporator({
            signature: true,
            title: "Incorporator",
            ...generateFormationUSAddress({}),
          })
        );
        await getPageHelper({ legalStructureId }, { incorporators });
        expect(
          screen.queryByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false })
        ).not.toBeInTheDocument();
      });

      it("fires validations when incorporators do not fill out all the fields", async () => {
        const incorporators = [
          generateFormationIncorporator({
            name: "",
            title: "Incorporator",
            ...generateFormationUSAddress({}),
          }),
        ];
        const page = await getPageHelper({ legalStructureId }, { incorporators });
        await attemptApiSubmission(page);

        const signerErrorText = () => {
          return screen.queryByText(Config.businessFormationDefaults.signerNameErrorText, { exact: false });
        };
        expect(signerErrorText()).toBeInTheDocument();
        const nameTd = screen.getByText(incorporators[0].addressLine1, { exact: false });
        // eslint-disable-next-line testing-library/no-node-access
        fireEvent.click(nameTd.parentElement?.querySelector('button[aria-label="edit"]') as Element);
        page.fillText("Address name", "Elrond");
        page.clickAddressSubmit();
        expect(signerErrorText()).not.toBeInTheDocument();
      });

      it("fires validations when incorporators do not check the sign checkbox", async () => {
        const incorporators = [generateFormationIncorporator({ title: "Incorporator" })];
        const page = await getPageHelper({ legalStructureId }, { incorporators });
        await attemptApiSubmission(page);
        const signerCheckboxErrorText = () => {
          return screen.queryByText(Config.businessFormationDefaults.signerCheckboxErrorText, {
            exact: false,
          });
        };
        expect(signerCheckboxErrorText()).toBeInTheDocument();
        page.checkSignerBox(0, "incorporators");
        expect(signerCheckboxErrorText()).not.toBeInTheDocument();
        await page.submitContactsStep();
      });
    });
  });

  describe("when llc", () => {
    const legalStructureId = "limited-liability-company";

    it("auto-fills fields from userData if it exists", async () => {
      const members: FormationMember[] = [
        {
          name: "Joe Biden",
          addressCity: "Washington",
          addressLine1: "1600 Pennsylvania Ave NW",
          addressLine2: "Office of the President",
          addressState: { name: "District of Columbia", shortCode: "DC" },
          addressCountry: "US",
          addressZipCode: "20500",
        },
      ];
      const formationFormData = generateFormationFormData(
        {
          members,
          signers: [
            generateFormationSigner({
              name: `signer 1`,
              signature: true,
              title: "Authorized Representative",
            }),
            generateFormationSigner({
              name: `signer 2`,
              signature: true,
              title: "Authorized Representative",
            }),
            generateFormationSigner({
              name: `signer 3`,
              signature: true,
              title: "Authorized Representative",
            }),
          ],
        },
        { legalStructureId }
      );

      const page = await getPageHelper({ legalStructureId }, formationFormData);

      expect(screen.getByTestId("addresses-members")).toBeInTheDocument();
      expect(
        screen.queryByText(
          displayContent.formationDisplayContent[legalStructureId].members.placeholder as string
        )
      ).not.toBeInTheDocument();
      expect(screen.getByText(members[0].name)).toBeInTheDocument();
      expect(screen.getByText(members[0].addressLine1, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressLine2, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressCity as string, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressState!.name, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(members[0].addressZipCode, { exact: false })).toBeInTheDocument();
      expect(page.getInputElementByLabel("Signer 0").value).toBe("signer 1");
      expect(page.getInputElementByLabel("Signer 1").value).toBe("signer 2");
      expect(page.getInputElementByLabel("Signer 2").value).toBe("signer 3");
    });

    describe(`members for ${legalStructureId}`, () => {
      it("edits members", async () => {
        const members = [...Array(2)].map(() => {
          return generateFormationMember({});
        });
        const page = await getPageHelper({ legalStructureId }, { members });

        expect(
          screen.getByText(Config.businessFormationDefaults.membersNewButtonText, { exact: false })
        ).toBeInTheDocument();
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
          expect(
            screen.getByText(Config.businessFormationDefaults.membersSuccessTextBody, { exact: false })
          ).toBeInTheDocument();
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

      it("saves and displays municipality name, not displayName", async () => {
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
          screen.getByText(Config.businessFormationDefaults.addressModalCityErrorText, { exact: false })
        ).toBeInTheDocument();
        expect(
          screen.getByText(Config.businessFormationDefaults.addressStateErrorText, { exact: false })
        ).toBeInTheDocument();
        expect(
          screen.getByText(Config.businessFormationDefaults.addressModalZipCodeErrorText, { exact: false })
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
          screen.queryByText(Config.businessFormationDefaults.addressModalZipCodeErrorText, { exact: false })
        ).not.toBeInTheDocument();
        page.clickAddressSubmit();
        await waitFor(() => {
          expect(
            screen.getByText(Config.businessFormationDefaults.membersSuccessTextBody, { exact: false })
          ).toBeInTheDocument();
        });
      });

      it("resets form on cancel", async () => {
        const page = await getPageHelper({ legalStructureId }, {});
        await page.openAddressModal("members");

        page.selectCheckbox(Config.businessFormationDefaults.membersCheckboxText);
        page.fillText("Address name", "Lincoln");
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
        const nineMembers = Array(9).fill(generateFormationSigner({}));
        const page = await getPageHelper(
          { legalStructureId },
          {
            members: nineMembers,
          }
        );

        expect(
          screen.getByText(Config.businessFormationDefaults.membersNewButtonText, { exact: false })
        ).toBeInTheDocument();

        await page.openAddressModal("members");
        page.selectCheckbox(Config.businessFormationDefaults.membersCheckboxText);
        page.fillText("Address name", "Lincoln");
        page.clickAddressSubmit();

        await waitFor(() => {
          return expect(
            screen.queryByText(Config.businessFormationDefaults.addressModalBackButtonText)
          ).not.toBeInTheDocument();
        });
        expect(
          screen.queryByText(Config.businessFormationDefaults.membersNewButtonText, { exact: false })
        ).not.toBeInTheDocument();
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

    describe(`signers for ${legalStructureId}`, () => {
      it("adds additional signer", async () => {
        const page = await getPageHelper({ legalStructureId }, { signers: [] });
        expect(
          screen.getByText(
            displayContent.formationDisplayContent[legalStructureId].signatureHeader.placeholder as string
          )
        ).toBeInTheDocument();
        page.clickAddNewSigner();
        page.fillText("Signer 0", "Red Skull");
        page.checkSignerBox(0, "signers");

        page.clickAddNewSigner();
        page.fillText("Signer 1", "V");
        page.checkSignerBox(1, "signers");

        await page.submitContactsStep();
        expect(currentUserData().formationData.formationFormData.signers).toEqual([
          { ...createEmptyFormationSigner(legalStructureId), name: "Red Skull", signature: true },
          { ...createEmptyFormationSigner(legalStructureId), name: "V", signature: true },
        ]);
      });

      it("deletes an additional signer", async () => {
        const page = await getPageHelper({ legalStructureId }, { signers: [] });
        page.clickAddNewSigner();
        page.fillText("Signer 0", "Red Skull");
        page.checkSignerBox(0, "signers");

        page.clickAddNewSigner();
        page.fillText("Signer 1", "V");
        page.checkSignerBox(1, "signers");

        fireEvent.click(screen.getAllByLabelText("delete additional signer")[0]);

        await page.submitContactsStep();
        expect(currentUserData().formationData.formationFormData.signers).toEqual([
          { ...createEmptyFormationSigner(legalStructureId), name: "Red Skull", signature: true },
        ]);
      });

      it("does not add more than 9 additional signers", async () => {
        const signers = Array(9).fill(generateFormationSigner({}));
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
          { signers: [generateFormationSigner({ name: "" })] }
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
          { signers: [generateFormationSigner({ signature: false })] }
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
  });

  describe("registered agent", () => {
    it("auto-fills fields when agent number is selected", async () => {
      const page = await getPageHelper(
        {},
        {
          agentNumber: "123465798",
          agentNumberOrManual: "NUMBER",
        }
      );
      expect(page.getInputElementByLabel("Agent number").value).toBe("123465798");
    });

    it("auto-fills fields when agent is manual entry", async () => {
      const page = await getPageHelper(
        {},
        {
          agentNumberOrManual: "MANUAL_ENTRY",
          agentName: "agent 1",
          agentEmail: "agent@email.com",
          agentOfficeAddressLine1: "123 agent address",
          agentOfficeAddressLine2: "agent suite 201",
          agentOfficeAddressMunicipality: generateMunicipality({ displayName: "Newark", name: "Newark" }),
          agentOfficeAddressZipCode: "99887",
        }
      );

      await waitFor(() => {
        expect(page.getInputElementByLabel("Agent name").value).toEqual("agent 1");
      });
      expect(page.getInputElementByLabel("Agent email").value).toEqual("agent@email.com");
      expect(page.getInputElementByLabel("Agent office address line1").value).toEqual("123 agent address");
      expect(page.getInputElementByLabel("Agent office address line2").value).toEqual("agent suite 201");
      expect(page.getInputElementByLabel("Agent office address municipality").value).toEqual("Newark");
      expect(page.getInputElementByLabel("Agent office address zip code").value).toEqual("99887");
    });

    it("defaults to registered agent number and toggles to manual with radio button", async () => {
      const page = await getPageHelper({}, { agentNumberOrManual: "NUMBER" });

      expect(screen.getByTestId("agent-number")).toBeInTheDocument();
      expect(screen.queryByTestId("agent-name")).not.toBeInTheDocument();

      page.chooseRadio("registered-agent-manual");

      expect(screen.queryByTestId("agent-number")).not.toBeInTheDocument();
      expect(screen.getByTestId("agent-name")).toBeInTheDocument();

      page.chooseRadio("registered-agent-number");

      expect(screen.getByTestId("agent-number")).toBeInTheDocument();
      expect(screen.queryByTestId("agent-name")).not.toBeInTheDocument();
    });

    it("auto-fills and disables agent name and email from user account when box checked", async () => {
      const page = await getPageHelper(
        {},
        {
          agentNumberOrManual: "MANUAL_ENTRY",
          agentEmail: "original@example.com",
          agentName: "Original Name",
          agentUseAccountInfo: false,
        },
        {
          name: "New Name",
          email: "new@example.com",
        }
      );

      expect(page.getInputElementByLabel("Agent name").value).toEqual("Original Name");
      expect(page.getInputElementByLabel("Agent email").value).toEqual("original@example.com");
      expect(page.getInputElementByLabel("Agent name").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent email").disabled).toEqual(false);

      page.selectCheckbox(Config.businessFormationDefaults.sameAgentInfoAsAccount);

      expect(page.getInputElementByLabel("Agent name").value).toEqual("New Name");
      expect(page.getInputElementByLabel("Agent email").value).toEqual("new@example.com");
      expect(page.getInputElementByLabel("Agent name").disabled).toEqual(true);
      expect(page.getInputElementByLabel("Agent email").disabled).toEqual(true);
    });

    it("un-disables but leaves values for agent name and email when user unchecks", async () => {
      const page = await getPageHelper(
        {},
        {
          agentNumberOrManual: "MANUAL_ENTRY",
          agentEmail: "original@example.com",
          agentName: "Original Name",
          agentUseAccountInfo: false,
        },
        {
          name: "New Name",
          email: "new@example.com",
        }
      );

      page.selectCheckbox(Config.businessFormationDefaults.sameAgentInfoAsAccount);
      page.selectCheckbox(Config.businessFormationDefaults.sameAgentInfoAsAccount);

      expect(page.getInputElementByLabel("Agent name").value).toEqual("New Name");
      expect(page.getInputElementByLabel("Agent email").value).toEqual("new@example.com");
      expect(page.getInputElementByLabel("Agent name").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent email").disabled).toEqual(false);
    });

    it("auto-fills and disables agent address from Address when box checked", async () => {
      const page = await getPageHelper(
        { municipality: generateMunicipality({ name: "New Test City", displayName: "New Test City" }) },
        {
          agentNumberOrManual: "MANUAL_ENTRY",
          agentOfficeAddressLine1: "Old Add 123",
          agentOfficeAddressLine2: "Old Add 456",
          agentOfficeAddressMunicipality: generateMunicipality({
            name: "Old Test City",
            displayName: "Old Test City",
          }),
          agentOfficeAddressZipCode: "07001",
          addressLine1: "New Add 123",
          addressLine2: "New Add 456",
          addressZipCode: "07002",
          addressState: { shortCode: "NJ", name: "New Jersey" },
          addressCountry: "US",
          agentUseAccountInfo: false,
        }
      );

      expect(page.getInputElementByLabel("Agent office address line1").value).toEqual("Old Add 123");
      expect(page.getInputElementByLabel("Agent office address line2").value).toEqual("Old Add 456");
      expect(page.getInputElementByLabel("Agent office address municipality").value).toEqual("Old Test City");
      expect(page.getInputElementByLabel("Agent office address zip code").value).toEqual("07001");
      expect(page.getInputElementByLabel("Agent office address line1").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address line2").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address municipality").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address zip code").disabled).toEqual(false);

      page.selectCheckbox(Config.businessFormationDefaults.sameAgentAddressAsBusiness);

      expect(page.getInputElementByLabel("Agent office address line1").value).toEqual("New Add 123");
      expect(page.getInputElementByLabel("Agent office address line2").value).toEqual("New Add 456");
      expect(page.getInputElementByLabel("Agent office address municipality").value).toEqual("New Test City");
      expect(page.getInputElementByLabel("Agent office address zip code").value).toEqual("07002");
      expect(page.getInputElementByLabel("Agent office address line1").disabled).toEqual(true);
      expect(page.getInputElementByLabel("Agent office address line2").disabled).toEqual(true);
      expect(page.getInputElementByLabel("Agent office address municipality").disabled).toEqual(true);
      expect(page.getInputElementByLabel("Agent office address zip code").disabled).toEqual(true);
    });

    it("fills & disables only fields with values when some fields missing", async () => {
      const page = await getPageHelper(
        { municipality: generateMunicipality({ name: "New Test City" }) },
        {
          agentNumberOrManual: "MANUAL_ENTRY",
          agentOfficeAddressLine1: "",
          agentOfficeAddressZipCode: "",
          addressLine1: "New Add 123",
          addressZipCode: "",
          addressState: { shortCode: "NJ", name: "New Jersey" },
          addressCountry: "US",
          agentUseAccountInfo: false,
        }
      );

      page.selectCheckbox(Config.businessFormationDefaults.sameAgentAddressAsBusiness);

      expect(page.getInputElementByLabel("Agent office address line1").value).toEqual("New Add 123");
      expect(page.getInputElementByLabel("Agent office address zip code").value).toEqual("");
      expect(page.getInputElementByLabel("Agent office address line1").disabled).toEqual(true);
      expect(page.getInputElementByLabel("Agent office address line2").disabled).toEqual(true);
      expect(page.getInputElementByLabel("Agent office address municipality").disabled).toEqual(true);
      expect(page.getInputElementByLabel("Agent office address zip code").disabled).toEqual(false);
    });

    it("shows inline validation for missing fields with checkbox", async () => {
      const page = await getPageHelper(
        { municipality: generateMunicipality({ name: "New Test City" }) },
        {
          agentNumberOrManual: "MANUAL_ENTRY",
          agentOfficeAddressLine1: "",
          addressLine1: "",
          agentUseAccountInfo: false,
        }
      );

      page.selectCheckbox(Config.businessFormationDefaults.sameAgentAddressAsBusiness);
      expect(
        screen.getByText(Config.businessFormationDefaults.agentOfficeAddressLine1ErrorText)
      ).toBeInTheDocument();
    });

    it("unselects checkbox when user interacts with non-disabled field", async () => {
      const page = await getPageHelper(
        { municipality: generateMunicipality({ name: "New Test City" }) },
        {
          agentNumberOrManual: "MANUAL_ENTRY",
          agentOfficeAddressZipCode: "",
          addressZipCode: "",
          agentUseAccountInfo: false,
        }
      );

      page.selectCheckbox(Config.businessFormationDefaults.sameAgentAddressAsBusiness);
      expect(
        page.getInputElementByLabel(Config.businessFormationDefaults.sameAgentAddressAsBusiness).checked
      ).toEqual(true);
      page.fillText("Agent office address zip code", "12345");
      expect(
        page.getInputElementByLabel(Config.businessFormationDefaults.sameAgentAddressAsBusiness).checked
      ).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address line1").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address line2").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address municipality").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address zip code").disabled).toEqual(false);
    });

    it("un-disables fields but leaves values when user unchecks same Address box", async () => {
      const page = await getPageHelper(
        { municipality: generateMunicipality({ name: "New Test City", displayName: "New Test City" }) },
        {
          agentNumberOrManual: "MANUAL_ENTRY",
          addressLine1: "New Add 123",
          addressLine2: "New Add 456",
          addressZipCode: "07002",
          addressState: { shortCode: "NJ", name: "New Jersey" },
          addressCountry: "US",
          agentUseBusinessAddress: false,
        }
      );

      page.selectCheckbox(Config.businessFormationDefaults.sameAgentAddressAsBusiness);
      page.selectCheckbox(Config.businessFormationDefaults.sameAgentAddressAsBusiness);

      expect(
        page.getInputElementByLabel(Config.businessFormationDefaults.sameAgentAddressAsBusiness).checked
      ).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address line1").value).toEqual("New Add 123");
      expect(page.getInputElementByLabel("Agent office address line2").value).toEqual("New Add 456");
      expect(page.getInputElementByLabel("Agent office address municipality").value).toEqual("New Test City");
      expect(page.getInputElementByLabel("Agent office address zip code").value).toEqual("07002");
      expect(page.getInputElementByLabel("Agent office address line1").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address line2").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address municipality").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address zip code").disabled).toEqual(false);
    });

    it("displays error message due to non-NJ zipcode is entered in registered agent address", async () => {
      const page = await getPageHelper(
        {},
        {
          agentOfficeAddressZipCode: "",
          agentNumberOrManual: "MANUAL_ENTRY",
        }
      );

      page.fillText("Agent office address zip code", "22222");

      await attemptApiSubmission(page);
      expect(
        screen.getByText(Config.businessFormationDefaults.agentOfficeAddressZipCodeErrorText)
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
      ).toBeInTheDocument();
    });

    describe("email validation", () => {
      it("displays error message when @ is missing in email input field", async () => {
        const page = await getPageHelper(
          {},
          {
            agentNumberOrManual: "MANUAL_ENTRY",
            agentEmail: "",
          }
        );

        page.fillText("Agent email", "deeb.gmail");

        await attemptApiSubmission(page);
        expect(screen.getByText(Config.businessFormationDefaults.agentEmailErrorText)).toBeInTheDocument();
        expect(
          screen.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
        ).toBeInTheDocument();
      });

      it("displays error message when email domain is missing in email input field", async () => {
        const page = await getPageHelper(
          {},
          {
            agentNumberOrManual: "MANUAL_ENTRY",
            agentEmail: "",
          }
        );

        page.fillText("Agent email", "deeb@");

        await attemptApiSubmission(page);
        expect(screen.getByText(Config.businessFormationDefaults.agentEmailErrorText)).toBeInTheDocument();
        expect(
          screen.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
        ).toBeInTheDocument();
      });

      it("passes email validation", async () => {
        const page = await getPageHelper(
          {},
          {
            agentNumberOrManual: "MANUAL_ENTRY",
            agentEmail: "",
          }
        );

        page.fillText("Agent email", "lol@deeb.gmail");
        await attemptApiSubmission(page);
        expect(
          screen.queryByText(Config.businessFormationDefaults.agentEmailErrorText)
        ).not.toBeInTheDocument();
      });
    });

    describe("required fields - when agent number selected", () => {
      it("agent number", async () => {
        const page = await getPageHelper(
          {},
          {
            agentNumber: "",
            agentNumberOrManual: "NUMBER",
          }
        );
        await attemptApiSubmission(page);
        expect(screen.getByRole("alert")).toHaveTextContent(
          Config.businessFormationDefaults.requiredFieldsBulletPointLabel.agentNumber
        );
      });
    });

    describe("required fields - when agent manual selected", () => {
      it("agent name", async () => {
        const page = await getPageHelper(
          {},
          {
            agentName: "",
            agentNumberOrManual: "MANUAL_ENTRY",
          }
        );
        await attemptApiSubmission(page);
        expect(screen.getByRole("alert")).toHaveTextContent(
          Config.businessFormationDefaults.requiredFieldsBulletPointLabel.agentName
        );
      });

      it("agent email", async () => {
        const page = await getPageHelper(
          {},
          {
            agentEmail: "",
            agentNumberOrManual: "MANUAL_ENTRY",
          }
        );
        await attemptApiSubmission(page);
        expect(screen.getByRole("alert")).toHaveTextContent(
          Config.businessFormationDefaults.requiredFieldsBulletPointLabel.agentEmail
        );
      });

      it("agent address line 1", async () => {
        const page = await getPageHelper(
          {},
          {
            agentOfficeAddressLine1: "",
            agentNumberOrManual: "MANUAL_ENTRY",
          }
        );
        await attemptApiSubmission(page);
        expect(screen.getByRole("alert")).toHaveTextContent(
          Config.businessFormationDefaults.requiredFieldsBulletPointLabel.agentOfficeAddressLine1
        );
      });

      it("Agent office address municipality", async () => {
        const page = await getPageHelper(
          {},
          {
            agentOfficeAddressMunicipality: undefined,
            agentNumberOrManual: "MANUAL_ENTRY",
          }
        );
        await attemptApiSubmission(page);
        expect(screen.getByRole("alert")).toHaveTextContent(
          Config.businessFormationDefaults.requiredFieldsBulletPointLabel.agentOfficeAddressMunicipality
        );
      });

      it("Agent office address zip code", async () => {
        const page = await getPageHelper(
          {},
          {
            agentOfficeAddressZipCode: "",
            agentNumberOrManual: "MANUAL_ENTRY",
          }
        );
        await attemptApiSubmission(page);
        expect(screen.getByRole("alert")).toHaveTextContent(
          Config.businessFormationDefaults.requiredFieldsBulletPointLabel.agentOfficeAddressZipCode
        );
      });
    });
  });

  const attemptApiSubmission = async (page: FormationPageHelpers) => {
    await page.stepperClickToReviewStep();
    await page.clickSubmit();
    await page.stepperClickToContactsStep();
  };
});
