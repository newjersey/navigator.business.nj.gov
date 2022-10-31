import {
  generateFormationAddress,
  generateFormationDisplayContent,
  generateFormationFormData,
  generateMunicipality,
  generateUser,
  generateUserData,
} from "@/test/factories";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  preparePage,
  setDesktopScreen,
  useSetupInitialMocks,
} from "@/test/helpers-formation";
import { currentUserData } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  BusinessUser,
  createEmptyFormationAddress,
  FormationFormData,
  FormationLegalType,
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

jest.mock("@mui/material", () => {
  return mockMaterialUI();
});
jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
jest.mock("@/lib/data-hooks/useRoadmap", () => {
  return { useRoadmap: jest.fn() };
});
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("next/router", () => {
  return { useRouter: jest.fn() };
});
jest.mock("@/lib/api-client/apiClient", () => {
  return {
    postBusinessFormation: jest.fn(),
    getCompletedFiling: jest.fn(),
    searchBusinessName: jest.fn(),
  };
});

describe("Formation - ContactsStep", () => {
  const displayContent = generateFormationDisplayContent({});

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
      formationFormData: generateFormationFormData(
        formationFormData,
        profileData.legalStructureId as FormationLegalType
      ),
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
            generateFormationAddress({
              name: `signer 1`,
              signature: true,
            }),
            generateFormationAddress({
              name: `signer 2`,
              signature: true,
            }),
            generateFormationAddress({
              name: `signer 3`,
              signature: true,
            }),
          ],
        },
        legalStructureId
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
          signers: [
            {
              name: "Donald Whatever",
              addressCity: "Miami",
              addressLine1: "160 Something Ave NW",
              addressLine2: "Office of Whatever",
              addressState: "Florida",
              addressZipCode: "20501",
              signature: true,
            },
            generateFormationAddress({ signature: false }),
          ],
        },
        legalStructureId
      );

      const page = await getPageHelper({ legalStructureId }, formationFormData);

      expect(screen.queryByTestId("addresses-members")).not.toBeInTheDocument();

      expect(screen.getByTestId("addresses-signers")).toBeInTheDocument();

      expect(
        screen.queryByText(displayContent[legalStructureId].members.placeholder as string)
      ).not.toBeInTheDocument();
      expect(screen.getByText(formationFormData.signers[0].name)).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.signers[0].addressLine1, { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.signers[0].addressLine2, { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.signers[0].addressCity, { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.signers[0].addressState, { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.signers[0].addressZipCode, { exact: false })
      ).toBeInTheDocument();
      expect(page.getSignerBox(0)).toEqual(true);
    });

    it("adds and syncs signer to members", async () => {
      const page = await getPageHelper({ legalStructureId }, { signers: [] });
      expect(
        screen.getByText(displayContent[legalStructureId].signatureHeader.placeholder as string)
      ).toBeInTheDocument();
      page.clickAddNewSigner();
      const signer = generateFormationAddress({ name: "Red Skull" });
      page.fillText("Address name", signer.name);
      page.fillText("Address line1", signer.addressLine1);
      page.fillText("Address line2", signer.addressLine2);
      page.fillText("Address city", signer.addressCity);
      page.fillText("Address state", signer.addressState);
      page.fillText("Address zip code", signer.addressZipCode);
      page.clickAddressSubmit();
      page.checkSignerBox(0);
      await page.submitContactsStep();
      expect(currentUserData().formationData.formationFormData.signers).toEqual([
        { ...signer, signature: true },
      ]);
      expect(currentUserData().formationData.formationFormData.members).toEqual([
        { ...signer, signature: true },
      ]);
    });

    it("adds signers address using business data via checkbox", async () => {
      const page = await getPageHelper(
        {
          legalStructureId,
          municipality: generateMunicipality({ displayName: "Hampton Borough", name: "Hampton" }),
        },
        {
          contactFirstName: "John",
          contactLastName: "Smith",
          businessAddressLine1: "123 business address",
          businessAddressLine2: "business suite 201",
          businessAddressState: "NJ",
          businessAddressZipCode: "07601",
        }
      );
      page.clickAddNewSigner();
      fireEvent.click(screen.getByTestId("default-checkbox"));
      expect(page.getInputElementByLabel("Address name").value).toBe("");
      expect(page.getInputElementByLabel("Address line1").value).toBe("123 business address");
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
      const formationFormData = generateFormationFormData(
        {
          members: [
            {
              name: "Joe Biden",
              addressCity: "Washington",
              addressLine1: "1600 Pennsylvania Ave NW",
              addressLine2: "Office of the President",
              addressState: "District of Columbia",
              addressZipCode: "20500",
              signature: false,
            },
          ],
          signers: [
            {
              name: "Donald Whatever",
              addressCity: "Miami",
              addressLine1: "160 Something Ave NW",
              addressLine2: "Office of Whatever",
              addressState: "Florida",
              addressZipCode: "20501",
              signature: true,
            },
            generateFormationAddress({ signature: false }),
          ],
        },
        legalStructureId
      );

      const page = await getPageHelper({ legalStructureId }, formationFormData);

      expect(screen.getByTestId("addresses-members")).toBeInTheDocument();
      expect(
        screen.queryByText(displayContent[legalStructureId].members.placeholder as string)
      ).not.toBeInTheDocument();
      expect(screen.getByText(formationFormData.members[0].name)).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.members[0].addressLine1, { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.members[0].addressLine2, { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.members[0].addressCity, { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.members[0].addressState, { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.members[0].addressZipCode, { exact: false })
      ).toBeInTheDocument();

      expect(screen.getByTestId("addresses-signers")).toBeInTheDocument();

      expect(
        screen.queryByText(displayContent[legalStructureId].members.placeholder as string)
      ).not.toBeInTheDocument();
      expect(screen.getByText(formationFormData.signers[0].name)).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.signers[0].addressLine1, { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.signers[0].addressLine2, { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.signers[0].addressCity, { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.signers[0].addressState, { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.signers[0].addressZipCode, { exact: false })
      ).toBeInTheDocument();
      expect(page.getSignerBox(0)).toEqual(true);
      expect(page.getSignerBox(1)).toEqual(false);
    });

    it("edits directors", async () => {
      const members = [...Array(2)].map(() => {
        return generateFormationAddress({});
      });
      const page = await getPageHelper({ legalStructureId }, { members });

      expect(
        screen.getByText(Config.businessFormationDefaults.directorsNewButtonText, { exact: false })
      ).toBeInTheDocument();
      const nameTd = screen.getByText(members[1].name, { exact: false });
      expect(nameTd).toBeInTheDocument();
      expect(
        screen.getByText(
          `${members[1].addressLine1}, ${members[1].addressLine2}, ${members[1].addressCity}, ${members[1].addressState} ${members[1].addressZipCode}`,
          { exact: false }
        )
      ).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-node-access
      fireEvent.click(nameTd.parentElement?.querySelector('button[aria-label="edit"]') as Element);
      expect(page.getInputElementByLabel("Address name").value).toBe(members[1].name);
      expect(page.getInputElementByLabel("Address line1").value).toBe(members[1].addressLine1);
      expect(page.getInputElementByLabel("Address line2").value).toBe(members[1].addressLine2);
      expect(page.getInputElementByLabel("Address city").value).toBe(members[1].addressCity);
      expect(page.getInputElementByLabel("Address state").value).toBe(members[1].addressState);
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
      expect(newMembers.length).toEqual(2);
      expect(
        newMembers.findIndex((member) => {
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

    describe(`signers for ${legalStructureId}`, () => {
      it("adds signer", async () => {
        const page = await getPageHelper({ legalStructureId }, { signers: [] });
        expect(
          screen.getByText(displayContent[legalStructureId].signatureHeader.placeholder as string)
        ).toBeInTheDocument();
        page.clickAddNewSigner();
        const signer = generateFormationAddress({ name: "Red Skull" });
        page.fillText("Address name", signer.name);
        page.fillText("Address line1", signer.addressLine1);
        page.fillText("Address line2", signer.addressLine2);
        page.fillText("Address city", signer.addressCity);
        page.fillText("Address state", signer.addressState);
        page.fillText("Address zip code", signer.addressZipCode);
        page.clickAddressSubmit();
        page.checkSignerBox(0);
        await page.submitContactsStep();
        expect(currentUserData().formationData.formationFormData.signers).toEqual([
          { ...signer, signature: true },
        ]);
      });

      it("edits signers", async () => {
        const signers = [...Array(2)].map(() => {
          return generateFormationAddress({ signature: true });
        });
        const page = await getPageHelper({ legalStructureId }, { signers });
        const nameTd = screen.getByText(signers[1].name, { exact: false });
        expect(nameTd).toBeInTheDocument();
        expect(
          screen.getByText(
            `${signers[1].addressLine1}, ${signers[1].addressLine2}, ${signers[1].addressCity}, ${signers[1].addressState} ${signers[1].addressZipCode}`,
            { exact: false }
          )
        ).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-node-access
        fireEvent.click(nameTd.parentElement?.querySelector('button[aria-label="edit"]') as Element);
        expect(page.getInputElementByLabel("Address name").value).toBe(signers[1].name);
        expect(page.getInputElementByLabel("Address line1").value).toBe(signers[1].addressLine1);
        expect(page.getInputElementByLabel("Address line2").value).toBe(signers[1].addressLine2);
        expect(page.getInputElementByLabel("Address city").value).toBe(signers[1].addressCity);
        expect(page.getInputElementByLabel("Address state").value).toBe(signers[1].addressState);
        expect(page.getInputElementByLabel("Address zip code").value).toBe(signers[1].addressZipCode);
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
        const newSigners = currentUserData().formationData.formationFormData.signers;
        expect(newSigners.length).toEqual(2);
        expect(
          newSigners.findIndex((signer) => {
            return signer.name == newName;
          })
        ).toEqual(1);
      });

      it("deletes an additional signer", async () => {
        const signers = [...Array(2)].map(() => {
          return generateFormationAddress({ signature: true });
        });
        const page = await getPageHelper({ legalStructureId }, { signers });
        const nameTd = screen.getByText(signers[1].name, { exact: false });
        // eslint-disable-next-line testing-library/no-node-access
        fireEvent.click(nameTd.parentElement?.querySelector('button[aria-label="delete"]') as Element);
        await page.submitContactsStep();
        expect(currentUserData().formationData.formationFormData.signers).toEqual([signers[0]]);
      });

      it("does not allow more than 10 signers", async () => {
        const signers = Array(10).fill(generateFormationAddress({}));
        await getPageHelper({ legalStructureId }, { signers });
        expect(
          screen.queryByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false })
        ).not.toBeInTheDocument();
      });

      it("fires validations when signers do not fill out all the fields", async () => {
        const signers = [generateFormationAddress({ name: "" })];
        const page = await getPageHelper({ legalStructureId }, { signers });
        await attemptApiSubmission(page);

        const signerErrorText = () => {
          return screen.queryByText(Config.businessFormationDefaults.signerNameErrorText, { exact: false });
        };
        expect(signerErrorText()).toBeInTheDocument();
        const nameTd = screen.getByText(signers[0].addressLine1, { exact: false });
        // eslint-disable-next-line testing-library/no-node-access
        fireEvent.click(nameTd.parentElement?.querySelector('button[aria-label="edit"]') as Element);
        page.fillText("Address name", "Elrond");
        page.clickAddressSubmit();
        expect(signerErrorText()).not.toBeInTheDocument();
      });

      it("fires validations when signers do not check the sign checkbox", async () => {
        const signers = [generateFormationAddress({})];
        const page = await getPageHelper({ legalStructureId }, { signers });
        await attemptApiSubmission(page);
        const signerCheckboxErrorText = () => {
          return screen.queryByText(Config.businessFormationDefaults.signerCheckboxErrorText, {
            exact: false,
          });
        };
        expect(signerCheckboxErrorText()).toBeInTheDocument();
        page.checkSignerBox(0);
        expect(signerCheckboxErrorText()).not.toBeInTheDocument();
        await page.submitContactsStep();
      });
    });
  });

  describe("when llc", () => {
    const legalStructureId = "limited-liability-company";

    it("auto-fills fields from userData if it exists", async () => {
      const formationFormData = generateFormationFormData(
        {
          members: [
            {
              name: "Joe Biden",
              addressCity: "Washington",
              addressLine1: "1600 Pennsylvania Ave NW",
              addressLine2: "Office of the President",
              addressState: "District of Columbia",
              addressZipCode: "20500",
              signature: false,
            },
          ],
          signers: [
            generateFormationAddress({
              name: `signer 1`,
              signature: true,
            }),
            generateFormationAddress({
              name: `signer 2`,
              signature: true,
            }),
            generateFormationAddress({
              name: `signer 3`,
              signature: true,
            }),
          ],
        },
        legalStructureId
      );

      const page = await getPageHelper({ legalStructureId }, formationFormData);

      expect(screen.getByTestId("addresses-members")).toBeInTheDocument();
      expect(
        screen.queryByText(displayContent[legalStructureId].members.placeholder as string)
      ).not.toBeInTheDocument();
      expect(screen.getByText(formationFormData.members[0].name)).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.members[0].addressLine1, { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.members[0].addressLine2, { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.members[0].addressCity, { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.members[0].addressState, { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText(formationFormData.members[0].addressZipCode, { exact: false })
      ).toBeInTheDocument();
      expect(page.getInputElementByLabel("Signer 0").value).toBe("signer 1");
      expect(page.getInputElementByLabel("Signer 1").value).toBe("signer 2");
      expect(page.getInputElementByLabel("Signer 2").value).toBe("signer 3");
    });

    describe(`members for ${legalStructureId}`, () => {
      it("edits members", async () => {
        const members = [...Array(2)].map(() => {
          return generateFormationAddress({});
        });
        const page = await getPageHelper({ legalStructureId }, { members });

        expect(
          screen.getByText(Config.businessFormationDefaults.membersNewButtonText, { exact: false })
        ).toBeInTheDocument();
        const nameTd = screen.getByText(members[1].name, { exact: false });
        expect(nameTd).toBeInTheDocument();
        expect(
          screen.getByText(
            `${members[1].addressLine1}, ${members[1].addressLine2}, ${members[1].addressCity}, ${members[1].addressState} ${members[1].addressZipCode}`,
            { exact: false }
          )
        ).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-node-access
        fireEvent.click(nameTd.parentElement?.querySelector('button[aria-label="edit"]') as Element);
        expect(page.getInputElementByLabel("Address name").value).toBe(members[1].name);
        expect(page.getInputElementByLabel("Address line1").value).toBe(members[1].addressLine1);
        expect(page.getInputElementByLabel("Address line2").value).toBe(members[1].addressLine2);
        expect(page.getInputElementByLabel("Address city").value).toBe(members[1].addressCity);
        expect(page.getInputElementByLabel("Address state").value).toBe(members[1].addressState);
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
        expect(newMembers.length).toEqual(2);
        expect(
          newMembers.findIndex((member) => {
            return member.name == newName;
          })
        ).toEqual(1);
      });

      it("is able to delete members", async () => {
        const members = [...Array(2)].map(() => {
          return generateFormationAddress({});
        });
        const page = await getPageHelper({ legalStructureId }, { members });

        const nameTd = screen.getByText(members[1].name, { exact: false });
        expect(nameTd).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-node-access
        fireEvent.click(nameTd.parentElement?.querySelector('button[aria-label="delete"]') as Element);
        await page.submitContactsStep();
        const newMembers = currentUserData().formationData.formationFormData.members;
        expect(newMembers.length).toEqual(1);
        expect(
          newMembers.find((member) => {
            return member == members[1];
          })
        ).toBeFalsy();
      });

      it("adds members using business data using checkbox with name", async () => {
        const page = await getPageHelper(
          {
            legalStructureId,
            municipality: generateMunicipality({ displayName: "Hampton Borough", name: "Hampton" }),
          },
          {
            members: [],
            contactFirstName: "John",
            contactLastName: "Smith",
            businessAddressLine1: "123 business address",
            businessAddressLine2: "business suite 201",
            businessAddressState: "NJ",
            businessAddressZipCode: "07601",
          }
        );
        await page.openAddressModal("members");

        page.selectCheckbox(Config.businessFormationDefaults.membersCheckboxText);
        expect(page.getInputElementByLabel("Address name").value).toBe("John Smith");
        expect(page.getInputElementByLabel("Address line1").value).toBe("123 business address");
        expect(page.getInputElementByLabel("Address line2").value).toBe("business suite 201");
        expect(page.getInputElementByLabel("Address city").value).toBe("Hampton");
        expect(page.getInputElementByLabel("Address state").value).toBe("NJ");
        expect(page.getInputElementByLabel("Address zip code").value).toBe("07601");
      });

      it("adds members using business data using checkbox without name", async () => {
        const page = await getPageHelper(
          {
            legalStructureId,
            municipality: generateMunicipality({ displayName: "Hampton Borough", name: "Hampton" }),
          },
          {
            members: [generateFormationAddress({})],
            contactFirstName: "John",
            contactLastName: "Smith",
            businessAddressLine1: "123 business address",
            businessAddressLine2: "business suite 201",
            businessAddressState: "NJ",
            businessAddressZipCode: "07601",
          }
        );
        await page.openAddressModal("members");

        page.selectCheckbox(Config.businessFormationDefaults.membersCheckboxText);
        expect(page.getInputElementByLabel("Address name").value).toBe("");
        expect(page.getInputElementByLabel("Address line1").value).toBe("123 business address");
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
            businessAddressLine1: "123 business address",
            businessAddressLine2: "",
            businessAddressZipCode: "",
          }
        );
        await page.openAddressModal("members");

        page.selectCheckbox(Config.businessFormationDefaults.membersCheckboxText);
        expect(page.getInputElementByLabel("Address line1").value).toBe("123 business address");
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
            municipality: generateMunicipality({ displayName: "Hampton Borough", name: "Hampton" }),
          },
          {
            members: [],
            businessAddressLine1: "",
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
            municipality: generateMunicipality({ displayName: "Hampton Borough", name: "Hampton" }),
          },
          {
            members: [],
            businessAddressLine1: "123 business address",
            businessAddressLine2: "",
            businessAddressZipCode: "",
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
        const nineMembers = Array(9).fill(generateFormationAddress({}));
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
        expect(currentUserData().formationData.formationFormData.members.length).toEqual(10);
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
          screen.getByText(displayContent[legalStructureId].signatureHeader.placeholder as string)
        ).toBeInTheDocument();
        page.clickAddNewSigner();
        page.fillText("Signer 0", "Red Skull");
        page.checkSignerBox(0);

        page.clickAddNewSigner();
        page.fillText("Signer 1", "V");
        page.checkSignerBox(1);

        await page.submitContactsStep();
        expect(currentUserData().formationData.formationFormData.signers).toEqual([
          { ...createEmptyFormationAddress(), name: "Red Skull", signature: true },
          { ...createEmptyFormationAddress(), name: "V", signature: true },
        ]);
      });

      it("deletes an additional signer", async () => {
        const page = await getPageHelper({ legalStructureId }, { signers: [] });
        page.clickAddNewSigner();
        page.fillText("Signer 0", "Red Skull");
        page.checkSignerBox(0);

        page.clickAddNewSigner();
        page.fillText("Signer 1", "V");
        page.checkSignerBox(1);

        fireEvent.click(screen.getAllByLabelText("delete additional signer")[0]);

        await page.submitContactsStep();
        expect(currentUserData().formationData.formationFormData.signers).toEqual([
          { ...createEmptyFormationAddress(), name: "Red Skull", signature: true },
        ]);
      });

      it("does not add more than 9 additional signers", async () => {
        const signers = Array(9).fill(generateFormationAddress({}));
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
          { signers: [generateFormationAddress({ name: "" })] }
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
          { signers: [generateFormationAddress({ signature: false })] }
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
          agentOfficeAddressCity: "agent-city-402",
          agentOfficeAddressState: "DC",
          agentOfficeAddressZipCode: "99887",
        }
      );

      await waitFor(() => {
        expect(page.getInputElementByLabel("Agent name").value).toEqual("agent 1");
      });
      expect(page.getInputElementByLabel("Agent email").value).toEqual("agent@email.com");
      expect(page.getInputElementByLabel("Agent office address line1").value).toEqual("123 agent address");
      expect(page.getInputElementByLabel("Agent office address line2").value).toEqual("agent suite 201");
      expect(page.getInputElementByLabel("Agent office address city").value).toEqual("agent-city-402");
      expect(page.getInputElementByLabel("Agent office address state").value).toEqual("DC");
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

    it("auto-fills and disables (excl. state) agent address from business address when box checked", async () => {
      const page = await getPageHelper(
        { municipality: generateMunicipality({ name: "New Test City" }) },
        {
          agentNumberOrManual: "MANUAL_ENTRY",
          agentOfficeAddressLine1: "Old Add 123",
          agentOfficeAddressLine2: "Old Add 456",
          agentOfficeAddressCity: "Old Test City",
          agentOfficeAddressZipCode: "07001",
          agentOfficeAddressState: "CA",
          businessAddressLine1: "New Add 123",
          businessAddressLine2: "New Add 456",
          businessAddressZipCode: "07002",
          businessAddressState: "NJ",
          agentUseAccountInfo: false,
        }
      );

      expect(page.getInputElementByLabel("Agent office address line1").value).toEqual("Old Add 123");
      expect(page.getInputElementByLabel("Agent office address line2").value).toEqual("Old Add 456");
      expect(page.getInputElementByLabel("Agent office address city").value).toEqual("Old Test City");
      expect(page.getInputElementByLabel("Agent office address zip code").value).toEqual("07001");
      expect(page.getInputElementByLabel("Agent office address state").value).toEqual("CA");
      expect(page.getInputElementByLabel("Agent office address line1").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address line2").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address city").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address zip code").disabled).toEqual(false);

      page.selectCheckbox(Config.businessFormationDefaults.sameAgentAddressAsBusiness);

      expect(page.getInputElementByLabel("Agent office address line1").value).toEqual("New Add 123");
      expect(page.getInputElementByLabel("Agent office address line2").value).toEqual("New Add 456");
      expect(page.getInputElementByLabel("Agent office address city").value).toEqual("New Test City");
      expect(page.getInputElementByLabel("Agent office address zip code").value).toEqual("07002");
      expect(page.getInputElementByLabel("Agent office address state").value).toEqual("NJ");
      expect(page.getInputElementByLabel("Agent office address line1").disabled).toEqual(true);
      expect(page.getInputElementByLabel("Agent office address line2").disabled).toEqual(true);
      expect(page.getInputElementByLabel("Agent office address city").disabled).toEqual(true);
      expect(page.getInputElementByLabel("Agent office address zip code").disabled).toEqual(true);
    });

    it("fills & disables only fields with values when some fields missing", async () => {
      const page = await getPageHelper(
        { municipality: generateMunicipality({ name: "New Test City" }) },
        {
          agentNumberOrManual: "MANUAL_ENTRY",
          agentOfficeAddressLine1: "",
          agentOfficeAddressZipCode: "",
          agentOfficeAddressState: "",
          businessAddressLine1: "New Add 123",
          businessAddressZipCode: "",
          businessAddressState: "NJ",
          agentUseAccountInfo: false,
        }
      );

      page.selectCheckbox(Config.businessFormationDefaults.sameAgentAddressAsBusiness);

      expect(page.getInputElementByLabel("Agent office address line1").value).toEqual("New Add 123");
      expect(page.getInputElementByLabel("Agent office address zip code").value).toEqual("");
      expect(page.getInputElementByLabel("Agent office address state").value).toEqual("NJ");
      expect(page.getInputElementByLabel("Agent office address line1").disabled).toEqual(true);
      expect(page.getInputElementByLabel("Agent office address line2").disabled).toEqual(true);
      expect(page.getInputElementByLabel("Agent office address city").disabled).toEqual(true);
      expect(page.getInputElementByLabel("Agent office address zip code").disabled).toEqual(false);
    });

    it("shows inline validation for missing fields with checkbox", async () => {
      const page = await getPageHelper(
        { municipality: generateMunicipality({ name: "New Test City" }) },
        {
          agentNumberOrManual: "MANUAL_ENTRY",
          agentOfficeAddressLine1: "",
          businessAddressLine1: "",
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
          businessAddressZipCode: "",
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
      expect(page.getInputElementByLabel("Agent office address city").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address zip code").disabled).toEqual(false);
    });

    it("un-disables fields but leaves values when user unchecks same business address box", async () => {
      const page = await getPageHelper(
        { municipality: generateMunicipality({ name: "New Test City" }) },
        {
          agentNumberOrManual: "MANUAL_ENTRY",
          businessAddressLine1: "New Add 123",
          businessAddressLine2: "New Add 456",
          businessAddressZipCode: "07002",
          businessAddressState: "NJ",
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
      expect(page.getInputElementByLabel("Agent office address city").value).toEqual("New Test City");
      expect(page.getInputElementByLabel("Agent office address zip code").value).toEqual("07002");
      expect(page.getInputElementByLabel("Agent office address state").value).toEqual("NJ");
      expect(page.getInputElementByLabel("Agent office address line1").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address line2").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address city").disabled).toEqual(false);
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

      it("Agent office address city", async () => {
        const page = await getPageHelper(
          {},
          {
            agentOfficeAddressCity: "",
            agentNumberOrManual: "MANUAL_ENTRY",
          }
        );
        await attemptApiSubmission(page);
        expect(screen.getByRole("alert")).toHaveTextContent(
          Config.businessFormationDefaults.requiredFieldsBulletPointLabel.agentOfficeAddressCity
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
