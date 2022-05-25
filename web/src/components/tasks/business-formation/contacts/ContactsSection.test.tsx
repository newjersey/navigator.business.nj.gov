import {
  generateFormationDisplayContent,
  generateFormationFormData,
  generateFormationMember,
  generateFormationSigner,
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
import { currentUserData, userDataUpdatedNTimes } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  BusinessUser,
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

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("next/router");
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
  searchBusinessName: jest.fn(),
}));

describe("Formation - ContactsSection", () => {
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

    await page.submitBusinessNameTab();
    await page.submitBusinessTab();
    return page;
  };

  describe("when llp", () => {
    const legalStructureId: FormationLegalType = "limited-liability-partnership";

    it("auto-fills fields from userData if it exists", async () => {
      const formationFormData = generateFormationFormData(
        {
          members: [],
          signer: {
            name: `signer 1`,
            signature: true,
          },
          additionalSigners: [
            {
              name: `signer 2`,
              signature: true,
            },
            {
              name: `signer 3`,
              signature: true,
            },
          ],
        },
        legalStructureId
      );

      const page = await getPageHelper({ legalStructureId }, formationFormData);

      expect(screen.queryByTestId("members")).not.toBeInTheDocument();
      expect(page.getInputElementByLabel("Signer").value).toBe("signer 1");
      expect(page.getInputElementByLabel("Additional signers 0").value).toBe("signer 2");
      expect(page.getInputElementByLabel("Additional signers 1").value).toBe("signer 3");
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
            },
          ],
          signer: {
            name: `signer 1`,
            signature: true,
          },
          additionalSigners: [
            {
              name: `signer 2`,
              signature: true,
            },
            {
              name: `signer 3`,
              signature: true,
            },
          ],
        },
        legalStructureId
      );

      const page = await getPageHelper({ legalStructureId }, formationFormData);

      expect(screen.getByTestId("members")).toBeInTheDocument();
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
      expect(page.getInputElementByLabel("Signer").value).toBe("signer 1");
      expect(page.getInputElementByLabel("Additional signers 0").value).toBe("signer 2");
      expect(page.getInputElementByLabel("Additional signers 1").value).toBe("signer 3");
    });

    describe(`members for ${legalStructureId}`, () => {
      it("edits members", async () => {
        const members = [...Array(2)].map(() => generateFormationMember({}));
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
        expect(page.getInputElementByLabel("Member name").value).toBe(members[1].name);
        expect(page.getInputElementByLabel("Member address line1").value).toBe(members[1].addressLine1);
        expect(page.getInputElementByLabel("Member address line2").value).toBe(members[1].addressLine2);
        expect(page.getInputElementByLabel("Member address city").value).toBe(members[1].addressCity);
        expect(page.getInputElementByLabel("Member address state").value).toBe(members[1].addressState);
        expect(page.getInputElementByLabel("Member address zip code").value).toBe(members[1].addressZipCode);
        const newName = "Joe Biden";
        page.fillText("Member name", newName);
        page.clickMemberSubmit();
        await waitFor(() => {
          expect(
            screen.getByText(Config.businessFormationDefaults.membersSuccessTextBody, { exact: false })
          ).toBeInTheDocument();
        });
        expect(screen.getByText(newName, { exact: false })).toBeInTheDocument();
        await page.submitContactsTab();
        const newMembers = currentUserData().formationData.formationFormData.members;
        expect(newMembers.length).toEqual(2);
        expect(newMembers.findIndex((member) => member.name == newName)).toEqual(1);
      });

      it("is able to delete members", async () => {
        const members = [...Array(2)].map(() => generateFormationMember({}));
        const page = await getPageHelper({ legalStructureId }, { members });

        const nameTd = screen.getByText(members[1].name, { exact: false });
        expect(nameTd).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-node-access
        fireEvent.click(nameTd.parentElement?.querySelector('button[aria-label="delete"]') as Element);
        await page.submitContactsTab();
        const newMembers = currentUserData().formationData.formationFormData.members;
        expect(newMembers.length).toEqual(1);
        expect(newMembers.find((member) => member == members[1])).toBeFalsy();
      });

      it("adds members using business data using checkbox", async () => {
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
        await page.openMemberModal();

        page.selectCheckbox(Config.businessFormationDefaults.membersCheckboxText);
        expect(page.getInputElementByLabel("Member name").value).toBe("John Smith");
        expect(page.getInputElementByLabel("Member address line1").value).toBe("123 business address");
        expect(page.getInputElementByLabel("Member address line2").value).toBe("business suite 201");
        expect(page.getInputElementByLabel("Member address city").value).toBe("Hampton");
        expect(page.getInputElementByLabel("Member address state").value).toBe("NJ");
        expect(page.getInputElementByLabel("Member address zip code").value).toBe("07601");
      });

      it("shows validation on submit", async () => {
        const page = await getPageHelper({ legalStructureId }, {});
        await page.openMemberModal();
        page.clickMemberSubmit();

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
          screen.getByText(Config.businessFormationDefaults.addressZipCodeErrorText, { exact: false })
        ).toBeInTheDocument();
        await page.fillMemberModal({});
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
          screen.queryByText(Config.businessFormationDefaults.addressZipCodeErrorText, { exact: false })
        ).not.toBeInTheDocument();
        page.clickMemberSubmit();
        await waitFor(() => {
          expect(
            screen.getByText(Config.businessFormationDefaults.membersSuccessTextBody, { exact: false })
          ).toBeInTheDocument();
        });
      });

      it("resets form on cancel", async () => {
        const page = await getPageHelper(
          { legalStructureId },
          {
            contactFirstName: "John",
            contactLastName: "Smith",
          }
        );
        await page.openMemberModal();

        page.selectCheckbox(Config.businessFormationDefaults.membersCheckboxText);
        expect(page.getInputElementByLabel("Member name").value).toBe("John Smith");
        fireEvent.click(screen.getByText(Config.businessFormationDefaults.membersModalBackButtonText));
        await waitFor(() =>
          expect(
            screen.queryByText(Config.businessFormationDefaults.membersModalBackButtonText)
          ).not.toBeInTheDocument()
        );
        await page.openMemberModal();
        expect(page.getInputElementByLabel("Member name").value).toBe("");
      });

      it("does not add more than 10 members", async () => {
        const nineMembers = Array(9).fill(generateFormationMember({}));
        const page = await getPageHelper(
          { legalStructureId },
          {
            members: nineMembers,
          }
        );

        expect(
          screen.getByText(Config.businessFormationDefaults.membersNewButtonText, { exact: false })
        ).toBeInTheDocument();

        await page.openMemberModal();
        page.selectCheckbox(Config.businessFormationDefaults.membersCheckboxText);
        page.clickMemberSubmit();

        await waitFor(() =>
          expect(
            screen.queryByText(Config.businessFormationDefaults.membersModalBackButtonText)
          ).not.toBeInTheDocument()
        );
        expect(
          screen.queryByText(Config.businessFormationDefaults.membersNewButtonText, { exact: false })
        ).not.toBeInTheDocument();
        await page.submitContactsTab();
        expect(currentUserData().formationData.formationFormData.members.length).toEqual(10);
      });

      it("renders mobile view of members table", async () => {
        setDesktopScreen(false);
        const page = await getPageHelper({ legalStructureId }, { members: [] });
        await page.fillAndSubmitMemberModal({});
        expect(screen.getByTestId("members-table-mobile")).toBeInTheDocument();
      });
    });
  });
  describe("signers", () => {
    it("adds additional signers", async () => {
      const page = await getPageHelper({}, { additionalSigners: [] });
      page.clickAddNewSigner();
      page.fillText("Additional signers 0", "Red Skull");
      page.checkSignerBox(0);

      page.clickAddNewSigner();
      page.fillText("Additional signers 1", "V");
      page.checkSignerBox(1);

      await page.submitContactsTab();
      expect(currentUserData().formationData.formationFormData.additionalSigners).toEqual([
        { name: "Red Skull", signature: true },
        { name: "V", signature: true },
      ]);
    });

    it("deletes an additional signer", async () => {
      const page = await getPageHelper({}, { additionalSigners: [] });
      page.clickAddNewSigner();
      page.fillText("Additional signers 0", "Red Skull");
      page.checkSignerBox(0);

      page.clickAddNewSigner();
      page.fillText("Additional signers 1", "V");
      page.checkSignerBox(1);

      fireEvent.click(screen.getAllByLabelText("delete additional signer")[0]);

      await page.submitContactsTab();
      expect(currentUserData().formationData.formationFormData.additionalSigners).toEqual([
        {
          name: "V",
          signature: true,
        },
      ]);
    });

    it("does not add more than 9 additional signers", async () => {
      const eightSigners = Array(8).fill(generateFormationSigner({}));
      const page = await getPageHelper({}, { additionalSigners: eightSigners });

      const addNewSignerButton = () =>
        screen.queryByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false });

      expect(addNewSignerButton()).toBeInTheDocument();
      page.clickAddNewSigner();
      expect(addNewSignerButton()).not.toBeInTheDocument();
    });

    it("fires validations when signers do not sign correctly", async () => {
      const page = await getPageHelper({}, { signer: { name: "", signature: false }, additionalSigners: [] });
      await page.submitContactsTab(false);
      const signerErrorText = () =>
        screen.queryByText(Config.businessFormationDefaults.signersEmptyErrorText, { exact: false });
      const signerCheckboxErrorText = () =>
        screen.queryByText(Config.businessFormationDefaults.signatureCheckboxErrorText, { exact: false });

      expect(signerErrorText()).toBeInTheDocument();
      page.fillText("Signer", "Elrond");
      expect(signerErrorText()).not.toBeInTheDocument();
      expect(signerCheckboxErrorText()).toBeInTheDocument();
      page.selectCheckbox(`${Config.businessFormationDefaults.signatureColumnLabel}*`);
      expect(signerCheckboxErrorText()).not.toBeInTheDocument();
      await page.submitContactsTab();
    });

    describe("required fields", () => {
      it("signer name", async () => {
        const page = await getPageHelper({}, { signer: { name: "", signature: true } });
        await page.submitContactsTab(false);
        expect(userDataUpdatedNTimes()).toEqual(2);
      });

      it("signer signature", async () => {
        const page = await getPageHelper({}, { signer: { name: "asdf", signature: false } });
        await page.submitContactsTab(false);
        expect(userDataUpdatedNTimes()).toEqual(2);
      });

      it("additional signer signature", async () => {
        const page = await getPageHelper({}, { additionalSigners: [{ name: "asdf", signature: false }] });
        await page.submitContactsTab(false);
        expect(userDataUpdatedNTimes()).toEqual(2);
      });

      it("additional signer name", async () => {
        const page = await getPageHelper({}, { additionalSigners: [{ name: "", signature: true }] });
        await page.submitContactsTab(false);
        expect(userDataUpdatedNTimes()).toEqual(2);
      });

      it("does not require additional signer", async () => {
        const page = await getPageHelper({}, { additionalSigners: [] });
        await page.submitContactsTab();
        expect(userDataUpdatedNTimes()).toEqual(3);
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

    it("un-disables fields but leaves values when user unchecks same business address box", async () => {
      const page = await getPageHelper(
        { municipality: generateMunicipality({ name: "New Test City" }) },
        {
          agentNumberOrManual: "MANUAL_ENTRY",
          businessAddressLine1: "New Add 123",
          businessAddressLine2: "New Add 456",
          businessAddressZipCode: "07002",
          businessAddressState: "NJ",
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

      await page.submitContactsTab(false);
      await waitFor(() => {
        expect(
          screen.getByText(Config.businessFormationDefaults.agentOfficeAddressZipCodeErrorText)
        ).toBeInTheDocument();
      });
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

        await page.submitContactsTab(false);
        await waitFor(() => {
          expect(screen.getByText(Config.businessFormationDefaults.agentEmailErrorText)).toBeInTheDocument();
        });
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

        await page.submitContactsTab(false);
        await waitFor(() => {
          expect(screen.getByText(Config.businessFormationDefaults.agentEmailErrorText)).toBeInTheDocument();
        });
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

        await page.submitContactsTab();
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
        await page.submitContactsTab(false);
        expect(screen.getByRole("alert")).toHaveTextContent(/Agent number/);
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
        await page.submitContactsTab(false);
        expect(screen.getByRole("alert")).toHaveTextContent(/Agent name/);
      });

      it("agent email", async () => {
        const page = await getPageHelper(
          {},
          {
            agentEmail: "",
            agentNumberOrManual: "MANUAL_ENTRY",
          }
        );
        await page.submitContactsTab(false);
        expect(screen.getByRole("alert")).toHaveTextContent(/Agent email/);
      });

      it("agent address line 1", async () => {
        const page = await getPageHelper(
          {},
          {
            agentOfficeAddressLine1: "",
            agentNumberOrManual: "MANUAL_ENTRY",
          }
        );
        await page.submitContactsTab(false);
        expect(screen.getByRole("alert")).toHaveTextContent(/Agent office address line1/);
      });

      it("Agent office address city", async () => {
        const page = await getPageHelper(
          {},
          {
            agentOfficeAddressCity: "",
            agentNumberOrManual: "MANUAL_ENTRY",
          }
        );
        await page.submitContactsTab(false);
        expect(screen.getByRole("alert")).toHaveTextContent(/Agent office address city/);
      });

      it("Agent office address zip code", async () => {
        const page = await getPageHelper(
          {},
          {
            agentOfficeAddressZipCode: "",
            agentNumberOrManual: "MANUAL_ENTRY",
          }
        );
        await page.submitContactsTab(false);
        expect(screen.getByRole("alert")).toHaveTextContent(/Agent office address zip code/);
      });
    });

    describe("optional fields - submits successfully", () => {
      it("agent address line 2", async () => {
        const page = await getPageHelper(
          {},
          {
            agentOfficeAddressLine2: "",
            agentNumberOrManual: "MANUAL_ENTRY",
          }
        );
        await page.submitContactsTab();
        expect(userDataUpdatedNTimes()).toEqual(3);
      });
    });
  });
});
