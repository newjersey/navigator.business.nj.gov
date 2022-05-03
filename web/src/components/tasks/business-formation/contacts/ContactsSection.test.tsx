import {
  generateFormationDisplayContent,
  generateFormationFormData,
  generateFormationMember,
  generateFormationSigner,
  generateMunicipality,
  generateUserData,
} from "@/test/factories";
import {
  generateLLCProfileData,
  RenderedTask,
  renderTask,
  setDesktopScreen,
  useSetupInitialMocks,
} from "@/test/helpers-formation";
import { currentUserData, userDataUpdatedNTimes } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormationFormData, ProfileData } from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { fireEvent, waitFor } from "@testing-library/react";

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

  const renderSection = async (
    initialProfileData: Partial<ProfileData>,
    formationFormData: Partial<FormationFormData>
  ): Promise<RenderedTask> => {
    const profileData = generateLLCProfileData(initialProfileData);
    const formationData = {
      formationFormData: generateFormationFormData(formationFormData),
      formationResponse: undefined,
      getFilingResponse: undefined,
    };
    const renderedTask = renderTask(
      generateUserData({
        profileData,
        formationData,
      }),
      displayContent
    );

    await renderedTask.page.submitBusinessNameTab();
    await renderedTask.page.submitBusinessTab();
    return renderedTask;
  };

  it("auto-fills fields from userData if it exists", async () => {
    const formationFormData = generateFormationFormData({
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
    });

    const { subject, page } = await renderSection({}, formationFormData);

    expect(subject.queryByText(displayContent.members.placeholder as string)).not.toBeInTheDocument();
    expect(subject.getByText(formationFormData.members[0].name)).toBeInTheDocument();
    expect(
      subject.getByText(formationFormData.members[0].addressLine1, { exact: false })
    ).toBeInTheDocument();
    expect(
      subject.getByText(formationFormData.members[0].addressLine2, { exact: false })
    ).toBeInTheDocument();
    expect(subject.getByText(formationFormData.members[0].addressCity, { exact: false })).toBeInTheDocument();
    expect(
      subject.getByText(formationFormData.members[0].addressState, { exact: false })
    ).toBeInTheDocument();
    expect(
      subject.getByText(formationFormData.members[0].addressZipCode, { exact: false })
    ).toBeInTheDocument();
    expect(page.getInputElementByLabel("Signer").value).toBe("signer 1");
    expect(page.getInputElementByLabel("Additional signers 0").value).toBe("signer 2");
    expect(page.getInputElementByLabel("Additional signers 1").value).toBe("signer 3");
  });

  describe("signers", () => {
    it("adds additional signers", async () => {
      const { page } = await renderSection({}, { additionalSigners: [] });
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
      const { subject, page } = await renderSection({}, { additionalSigners: [] });
      page.clickAddNewSigner();
      page.fillText("Additional signers 0", "Red Skull");
      page.checkSignerBox(0);

      page.clickAddNewSigner();
      page.fillText("Additional signers 1", "V");
      page.checkSignerBox(1);

      fireEvent.click(subject.getAllByLabelText("delete additional signer")[0]);

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
      const { subject, page } = await renderSection({}, { additionalSigners: eightSigners });

      const addNewSignerButton = () =>
        subject.queryByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false });

      expect(addNewSignerButton()).toBeInTheDocument();
      page.clickAddNewSigner();
      expect(addNewSignerButton()).not.toBeInTheDocument();
    });

    it("fires validations when signers do not sign correctly", async () => {
      const { subject, page } = await renderSection(
        {},
        { signer: { name: "", signature: false }, additionalSigners: [] }
      );
      await page.submitContactsTab(false);
      const signerErrorText = () =>
        subject.queryByText(Config.businessFormationDefaults.signersEmptyErrorText, { exact: false });
      const signerCheckboxErrorText = () =>
        subject.queryByText(Config.businessFormationDefaults.signatureCheckboxErrorText, { exact: false });

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
        const { page } = await renderSection({}, { signer: { name: "", signature: true } });
        await page.submitContactsTab(false);
        expect(userDataUpdatedNTimes()).toEqual(2);
      });

      it("signer signature", async () => {
        const { page } = await renderSection({}, { signer: { name: "asdf", signature: false } });
        await page.submitContactsTab(false);
        expect(userDataUpdatedNTimes()).toEqual(2);
      });

      it("additional signer signature", async () => {
        const { page } = await renderSection({}, { additionalSigners: [{ name: "asdf", signature: false }] });
        await page.submitContactsTab(false);
        expect(userDataUpdatedNTimes()).toEqual(2);
      });

      it("additional signer name", async () => {
        const { page } = await renderSection({}, { additionalSigners: [{ name: "", signature: true }] });
        await page.submitContactsTab(false);
        expect(userDataUpdatedNTimes()).toEqual(2);
      });

      it("does not require additional signer", async () => {
        const { page } = await renderSection({}, { additionalSigners: [] });
        await page.submitContactsTab();
        expect(userDataUpdatedNTimes()).toEqual(3);
      });
    });
  });

  describe("members", () => {
    it("edits members", async () => {
      const members = [...Array(2)].map(() => generateFormationMember({}));
      const { subject, page } = await renderSection({}, { members });

      expect(
        subject.queryByText(Config.businessFormationDefaults.membersNewButtonText, { exact: false })
      ).toBeInTheDocument();
      const nameTd = subject.getByText(members[1].name, { exact: false });
      expect(nameTd).toBeInTheDocument();
      expect(
        subject.getByText(
          `${members[1].addressLine1}, ${members[1].addressLine2}, ${members[1].addressCity}, ${members[1].addressState} ${members[1].addressZipCode}`,
          { exact: false }
        )
      ).toBeInTheDocument();
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
          subject.getByText(Config.businessFormationDefaults.membersSuccessTextBody, { exact: false })
        ).toBeInTheDocument();
      });
      expect(subject.getByText(newName, { exact: false })).toBeInTheDocument();
      await page.submitContactsTab();
      const newMembers = currentUserData().formationData.formationFormData.members;
      expect(newMembers.length).toEqual(2);
      expect(newMembers.findIndex((member) => member.name == newName)).toEqual(1);
    });

    it("is able to delete members", async () => {
      const members = [...Array(2)].map(() => generateFormationMember({}));
      const { subject, page } = await renderSection({}, { members });

      const nameTd = subject.getByText(members[1].name, { exact: false });
      expect(nameTd).toBeInTheDocument();
      fireEvent.click(nameTd.parentElement?.querySelector('button[aria-label="delete"]') as Element);
      await page.submitContactsTab();
      const newMembers = currentUserData().formationData.formationFormData.members;
      expect(newMembers.length).toEqual(1);
      expect(newMembers.find((member) => member == members[1])).toBeFalsy();
    });

    it("adds members using business data using checkbox", async () => {
      const { page } = await renderSection(
        { municipality: generateMunicipality({ displayName: "Hampton Borough", name: "Hampton" }) },
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
      const { subject, page } = await renderSection({}, {});
      await page.openMemberModal();
      page.clickMemberSubmit();

      expect(
        subject.queryByText(Config.businessFormationDefaults.nameErrorText, { exact: false })
      ).toBeInTheDocument();
      expect(
        subject.queryByText(Config.businessFormationDefaults.addressErrorText, { exact: false })
      ).toBeInTheDocument();
      expect(
        subject.queryByText(Config.businessFormationDefaults.addressCityErrorText, { exact: false })
      ).toBeInTheDocument();
      expect(
        subject.queryByText(Config.businessFormationDefaults.addressStateErrorText, { exact: false })
      ).toBeInTheDocument();
      expect(
        subject.queryByText(Config.businessFormationDefaults.addressZipCodeErrorText, { exact: false })
      ).toBeInTheDocument();
      await page.fillMemberModal({});
      expect(
        subject.queryByText(Config.businessFormationDefaults.nameErrorText, { exact: false })
      ).not.toBeInTheDocument();
      expect(
        subject.queryByText(Config.businessFormationDefaults.addressErrorText, { exact: false })
      ).not.toBeInTheDocument();
      expect(
        subject.queryByText(Config.businessFormationDefaults.addressCityErrorText, { exact: false })
      ).not.toBeInTheDocument();
      expect(
        subject.queryByText(Config.businessFormationDefaults.addressStateErrorText, { exact: false })
      ).not.toBeInTheDocument();
      expect(
        subject.queryByText(Config.businessFormationDefaults.addressZipCodeErrorText, { exact: false })
      ).not.toBeInTheDocument();
      page.clickMemberSubmit();
      await waitFor(() => {
        expect(
          subject.getByText(Config.businessFormationDefaults.membersSuccessTextBody, { exact: false })
        ).toBeInTheDocument();
      });
    });

    it("resets form on cancel", async () => {
      const { subject, page } = await renderSection(
        {},
        {
          contactFirstName: "John",
          contactLastName: "Smith",
        }
      );
      await page.openMemberModal();

      page.selectCheckbox(Config.businessFormationDefaults.membersCheckboxText);
      expect(page.getInputElementByLabel("Member name").value).toBe("John Smith");
      fireEvent.click(subject.getByText(Config.businessFormationDefaults.membersModalBackButtonText));
      await waitFor(() =>
        expect(
          subject.queryByText(Config.businessFormationDefaults.membersModalBackButtonText)
        ).not.toBeInTheDocument()
      );
      await page.openMemberModal();
      expect(page.getInputElementByLabel("Member name").value).toBe("");
    });

    it("does not add more than 10 members", async () => {
      const nineMembers = Array(9).fill(generateFormationMember({}));
      const { subject, page } = await renderSection(
        {},
        {
          members: nineMembers,
        }
      );

      expect(
        subject.getByText(Config.businessFormationDefaults.membersNewButtonText, { exact: false })
      ).toBeInTheDocument();

      await page.openMemberModal();
      page.selectCheckbox(Config.businessFormationDefaults.membersCheckboxText);
      page.clickMemberSubmit();

      await waitFor(() =>
        expect(
          subject.queryByText(Config.businessFormationDefaults.membersModalBackButtonText)
        ).not.toBeInTheDocument()
      );
      expect(
        subject.queryByText(Config.businessFormationDefaults.membersNewButtonText, { exact: false })
      ).not.toBeInTheDocument();
      await page.submitContactsTab();
      expect(currentUserData().formationData.formationFormData.members.length).toEqual(10);
    });

    it("renders mobile view of members table", async () => {
      setDesktopScreen(false);
      const { subject, page } = await renderSection({}, { members: [] });
      await page.fillAndSubmitMemberModal({});
      expect(subject.getByTestId("members-table-mobile")).toBeInTheDocument();
    });
  });
});
