import { ProfileDefaults } from "@/display-defaults//ProfileDefaults";
import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";
import { createEmptyLoadDisplayContent, LoadDisplayContent } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import Profile from "@/pages/profile";
import {
  generateFormationData,
  generateGetFilingResponse,
  generateMunicipality,
  generateProfileData as generateProfileData,
  generateUser,
  generateUserData,
} from "@/test/factories";
import { withRoadmap } from "@/test/helpers";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  createEmptyUserData,
  LookupIndustryById,
  LookupOwnershipTypeById,
  Municipality,
  UserData,
} from "@businessnjgovnavigator/shared";
import { fireEvent, render, RenderResult, waitFor, within } from "@testing-library/react";
import dayjs from "dayjs";
import React from "react";

const date = dayjs().subtract(10, "days");

const dateOfFormation = date.format("YYYY-MM-DD");

jest.mock("next/router");
jest.mock("@/lib/auth/useAuthProtectedPage");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));

describe("profile", () => {
  let subject: RenderResult;

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    setupStatefulUserDataContext();
  });

  const renderPage = ({
    municipalities,
    displayContent,
    userData,
  }: {
    municipalities?: Municipality[];
    displayContent?: LoadDisplayContent;
    userData?: UserData;
  }): RenderResult => {
    const genericTown =
      userData && userData.profileData.municipality
        ? userData.profileData.municipality
        : generateMunicipality({ displayName: "GenericTown" });
    return render(
      <WithStatefulUserData
        initialUserData={
          userData || generateUserData({ profileData: generateProfileData({ municipality: genericTown }) })
        }
      >
        <Profile
          displayContent={displayContent || createEmptyLoadDisplayContent()}
          municipalities={municipalities ? [genericTown, ...municipalities] : [genericTown]}
        />
      </WithStatefulUserData>
    );
  };

  it("shows loading page if page has not loaded yet", () => {
    const subject = render(
      <WithStatefulUserData initialUserData={undefined}>
        <Profile displayContent={createEmptyLoadDisplayContent()} municipalities={[]} />
      </WithStatefulUserData>
    );

    expect(subject.getByText("Loading", { exact: false })).toBeInTheDocument();
    expect(subject.queryByText(ProfileDefaults.pageTitle)).not.toBeInTheDocument();
    expect(subject.queryByText(ProfileDefaults.pageTitle)).not.toBeInTheDocument();
  });

  describe("starting new business", () => {
    it("user is able to save and is redirected to roadmap", async () => {
      subject = renderPage({});
      fillText("Business name", "Cool Computers");
      clickSave();
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/roadmap?success=true"));
    });

    it("prevents user from going back to roadmap if there are unsaved changes", async () => {
      subject = renderPage({});
      fillText("Business name", "Cool Computers");
      clickBack();
      expect(subject.getByText(ProfileDefaults.escapeModalReturn)).toBeInTheDocument();
    });

    it("returns user to profile page from un-saved changes modal", async () => {
      subject = renderPage({});
      fillText("Business name", "Cool Computers");
      clickBack();
      fireEvent.click(subject.getByText(ProfileDefaults.escapeModalEscape));
      fillText("Business name", "Cool Computers2");
    });

    it("updates the user data on save", async () => {
      const initialUserData = createEmptyUserData(generateUser({}));
      const newark = generateMunicipality({ displayName: "Newark" });
      subject = renderPage({ userData: initialUserData, municipalities: [newark] });
      fillText("Business name", "Cool Computers");
      selectByText("Location", newark.displayName);
      selectByValue("Industry", "e-commerce");
      selectByValue("Legal structure", "c-corporation");
      fillText("Entity id", "0234567890");
      fillText("Tax id", "023456790");
      fillText("Employer id", "02-3456780");
      fillText("Notes", "whats appppppp");
      clickSave();

      await waitFor(() => {
        expect(subject.getByTestId("toast-alert-SUCCESS")).toBeInTheDocument();
        expect(currentUserData()).toEqual({
          ...initialUserData,
          formProgress: "COMPLETED",
          profileData: {
            ...initialUserData.profileData,
            businessName: "Cool Computers",
            industryId: "e-commerce",
            homeBasedBusiness: true,
            legalStructureId: "c-corporation",
            municipality: newark,
            taxId: "023456790",
            entityId: "0234567890",
            employerId: "023456780",
            notes: "whats appppppp",
          },
        });
      });
    });

    it("disables entityID field if formation getFiling success", () => {
      const userData = generateUserData({
        formationData: generateFormationData({
          getFilingResponse: generateGetFilingResponse({
            success: true,
          }),
        }),
        profileData: generateProfileData({
          legalStructureId: "c-corporation",
          entityId: "some-id",
        }),
      });

      subject = renderPage({ userData });
      expect(subject.getByLabelText("Entity id").getAttribute("disabled")).not.toBeNull();
    });

    it("prevents user from saving if they have not selected a location", async () => {
      const newark = generateMunicipality({ displayName: "Newark" });
      subject = renderPage({ municipalities: [newark] });
      fillText("Location", "");
      fireEvent.blur(subject.getByLabelText("Location"));
      clickSave();
      expect(subject.queryByText(OnboardingDefaults.errorTextRequiredMunicipality)).toBeInTheDocument();
      await waitFor(() => expect(subject.queryByTestId("toast-alert-ERROR")).toBeInTheDocument());
      selectByText("Location", newark.displayName);
      await waitFor(() =>
        expect(subject.queryByText(OnboardingDefaults.errorTextRequiredMunicipality)).not.toBeInTheDocument()
      );
    });

    it("entity-id field existing depends on legal structure", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: "general-partnership",
        }),
      });
      subject = renderPage({ userData });
      expect(subject.queryByLabelText("Entity id")).not.toBeInTheDocument();
    });

    it("prevents user from saving if they partially entered Employer Id", async () => {
      subject = renderPage({});
      fillText("Employer id", "123490");
      fireEvent.blur(subject.queryByLabelText("Employer id") as HTMLElement);
      clickSave();
      await waitFor(() => {
        expect(
          subject.queryByText(templateEval(OnboardingDefaults.errorTextMinimumNumericField, { length: "9" }))
        ).toBeInTheDocument();
        expect(subject.queryByTestId("toast-alert-ERROR")).toBeInTheDocument();
      });
    });

    it("user is able to go back to roadmap", async () => {
      subject = renderPage({});
      clickBack();
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/roadmap"));
    });

    it("prefills form from existing user data", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessName: "Applebees",
          industryId: "cosmetology",
          legalStructureId: "c-corporation",
          entityId: "1234567890",
          employerId: "123456789",
          taxId: "123456790",
          notes: "whats appppppp",
          municipality: generateMunicipality({
            displayName: "Newark",
          }),
        }),
      });

      subject = renderPage({ userData });
      expect(getBusinessNameValue()).toEqual("Applebees");

      expect(getIndustryValue()).toEqual(LookupIndustryById("cosmetology").name);

      expect(getLegalStructureValue()).toEqual("c-corporation");

      expect(getMunicipalityValue()).toEqual("Newark");
      expect(getEmployerIdValue()).toEqual("12-3456789");
      expect(getEntityIdValue()).toEqual("1234567890");
      expect(getTaxIdValue()).toEqual("123456790");
      expect(getNotesValue()).toEqual("whats appppppp");
    });

    it("builds and sets roadmap on save", async () => {
      const profileData = generateProfileData({});
      const mockSetRoadmap = jest.fn();

      subject = render(
        withRoadmap(
          <WithStatefulUserData initialUserData={generateUserData({ profileData: profileData })}>
            <Profile displayContent={createEmptyLoadDisplayContent()} municipalities={[]} />
          </WithStatefulUserData>,
          undefined,
          undefined,
          mockSetRoadmap
        )
      );
      clickSave();
      await waitFor(() => expect(currentUserData()));
      await waitFor(() => expect(mockSetRoadmap).toHaveBeenCalledTimes(1));
    });

    it("returns user to roadmap from un-saved changes modal", async () => {
      const initialUserData = createEmptyUserData(generateUser({}));
      const newark = generateMunicipality({ displayName: "Newark" });
      subject = renderPage({ userData: initialUserData, municipalities: [newark] });
      selectByText("Location", newark.displayName);
      clickBack();
      fireEvent.click(subject.getByText(ProfileDefaults.escapeModalReturn));
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/roadmap"));
      await waitFor(() => expect(() => currentUserData()).toThrowError());
    });
  });

  describe("has existing business", () => {
    it("user is able to save and is redirected to dashboard", async () => {
      const userData = generateUserData({ profileData: generateProfileData({ hasExistingBusiness: true }) });

      subject = renderPage({
        userData: userData,
      });

      fillText("Business name", "Cool Computers");
      clickSave();
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/dashboard?success=true"));
    });

    it("prevents user from going back to dashboard if there are unsaved changes", async () => {
      const userData = generateUserData({ profileData: generateProfileData({ hasExistingBusiness: true }) });

      subject = renderPage({
        userData: userData,
      });
      fillText("Business name", "Cool Computers");
      clickBack();
      expect(subject.getByText(ProfileDefaults.escapeModalReturn)).toBeInTheDocument();
    });

    it("returns user to profile page from un-saved changes modal", async () => {
      const userData = generateUserData({ profileData: generateProfileData({ hasExistingBusiness: true }) });

      subject = renderPage({
        userData: userData,
      });
      fillText("Business name", "Cool Computers");
      clickBack();
      fireEvent.click(subject.getByText(ProfileDefaults.escapeModalEscape));
      fillText("Business name", "Cool Computers2");
    });

    it("updates the user data on save", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({ hasExistingBusiness: true, industryId: undefined }),
      });
      const newark = generateMunicipality({ displayName: "Newark" });

      subject = renderPage({ userData: userData, municipalities: [newark] });

      fillText("Business name", "Cool Computers");
      selectByValue("Industry", "e-commerce");
      fillText("Existing employees", "123");
      selectByText("Location", newark.displayName);
      selectByValue("Ownership", "veteran-owned");
      selectByValue("Ownership", "woman-owned");
      fillText("Employer id", "02-3456780");
      fillText("Entity id", "0234567890");
      fillText("Date of formation", date.format("MM/DD/YYYY"));
      fillText("Tax id", "023456790");
      fillText("Notes", "whats appppppp");
      fillText("Tax pin", "6666");
      clickSave();

      await waitFor(() => {
        expect(subject.getByTestId("toast-alert-SUCCESS")).toBeInTheDocument();
        expect(currentUserData()).toEqual({
          ...userData,
          formProgress: "COMPLETED",
          profileData: {
            ...userData.profileData,
            businessName: "Cool Computers",
            industryId: "e-commerce",
            homeBasedBusiness: true,
            existingEmployees: "123",
            ownershipTypeIds: ["veteran-owned", "woman-owned"],
            municipality: newark,
            dateOfFormation,
            taxId: "023456790",
            entityId: "0234567890",
            employerId: "023456780",
            notes: "whats appppppp",
            taxPin: "6666",
          },
        });
      });
    });

    it("prefills form from existing user data", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          hasExistingBusiness: true,
          businessName: "Applebees",
          industryId: "e-commerce",
          entityId: "1234567890",
          employerId: "123456789",
          dateOfFormation,
          taxId: "123456790",
          notes: "whats appppppp",
          municipality: generateMunicipality({
            displayName: "Newark",
          }),
          ownershipTypeIds: ["veteran-owned", "woman-owned"],
          homeBasedBusiness: false,
          existingEmployees: "123",
          taxPin: "6666",
        }),
      });

      const veteran = LookupOwnershipTypeById("veteran-owned").name;
      const woman = LookupOwnershipTypeById("woman-owned").name;

      subject = renderPage({ userData });

      expect(getBusinessNameValue()).toEqual("Applebees");
      expect(getIndustryValue()).toEqual(LookupIndustryById("e-commerce").name);
      expect(getEmployerIdValue()).toEqual("12-3456789");
      expect(getEntityIdValue()).toEqual("1234567890");
      expect(getTaxIdValue()).toEqual("123456790");
      expect(getDateOfFormation()).toEqual(date.format("MM/DD/YYYY"));
      expect(getNotesValue()).toEqual("whats appppppp");
      expect(getMunicipalityValue()).toEqual("Newark");
      expect(subject.queryByLabelText("Ownership")).toHaveTextContent(`${veteran}, ${woman}`);
      expect(getExistingEmployeesValue()).toEqual("123");
      expect(getTaxPinValue()).toEqual("6666");
      expect(getRadioButtonFromFormControlLabel("home-based-business-false")).toBeChecked();
    });

    it("shows an error when dateOfFormation is empty", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({ hasExistingBusiness: true }),
      });
      subject = renderPage({ userData: userData });

      fillText("Date of formation", "");
      fireEvent.blur(subject.getByLabelText("Date of formation"));
      await waitFor(() => {
        expect(subject.queryByText(OnboardingDefaults.dateOfFormationErrorText)).toBeInTheDocument();
      });

      fillText("Date of formation", date.format("MM/DD/YYYY"));
      fireEvent.blur(subject.getByLabelText("Date of formation"));
      await waitFor(() => {
        expect(subject.queryByText(OnboardingDefaults.dateOfFormationErrorText)).not.toBeInTheDocument();
      });
    });

    it("shows an error when tax pin input is not empty or is less than 4 digits", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({ hasExistingBusiness: true }),
      });
      subject = renderPage({ userData: userData });

      fillText("Tax pin", "");
      fireEvent.blur(subject.getByLabelText("Tax pin"));
      expect(subject.queryByText(ProfileDefaults.taxPinErrorText)).not.toBeInTheDocument();

      fillText("Tax pin", "123");
      fireEvent.blur(subject.getByLabelText("Tax pin"));
      await waitFor(() => {
        expect(subject.queryByText(ProfileDefaults.taxPinErrorText)).toBeInTheDocument();
      });

      fillText("Tax pin", "1234");
      fireEvent.blur(subject.getByLabelText("Tax pin"));
      await waitFor(() => {
        expect(subject.queryByText(ProfileDefaults.taxPinErrorText)).not.toBeInTheDocument();
      });
    });

    it("prevents user from saving if they partially entered Employer Id", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({ hasExistingBusiness: true }),
      });
      subject = renderPage({ userData: userData });

      fillText("Employer id", "123490");
      fireEvent.blur(subject.queryByLabelText("Employer id") as HTMLElement);
      clickSave();
      await waitFor(() => {
        expect(
          subject.queryByText(templateEval(OnboardingDefaults.errorTextMinimumNumericField, { length: "9" }))
        ).toBeInTheDocument();
        expect(subject.queryByTestId("toast-alert-ERROR")).toBeInTheDocument();
      });
    });

    it("user is able to go back to dashboard", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({ hasExistingBusiness: true }),
      });
      subject = renderPage({ userData: userData });

      clickBack();
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/dashboard"));
    });

    it("builds and sets roadmap on save", async () => {
      const profileData = generateProfileData({ hasExistingBusiness: true });
      const mockSetRoadmap = jest.fn();

      subject = render(
        withRoadmap(
          <WithStatefulUserData initialUserData={generateUserData({ profileData: profileData })}>
            <Profile displayContent={createEmptyLoadDisplayContent()} municipalities={[]} />
          </WithStatefulUserData>,
          undefined,
          undefined,
          mockSetRoadmap
        )
      );
      clickSave();
      await waitFor(() => {
        expect(currentUserData());
        expect(mockSetRoadmap).toHaveBeenCalledTimes(1);
      });
    });

    it("returns user to dashboard from un-saved changes modal", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({ hasExistingBusiness: true }),
      });

      const newark = generateMunicipality({ displayName: "Newark" });
      subject = renderPage({ userData: userData, municipalities: [newark] });
      selectByText("Location", newark.displayName);
      clickBack();
      fireEvent.click(subject.getByText(ProfileDefaults.escapeModalReturn));
      await waitFor(() => {
        expect(mockRouter.mockPush).toHaveBeenCalledWith("/dashboard");
        expect(() => currentUserData()).toThrowError();
      });
    });
  });

  const fillText = (label: string, value: string) => {
    fireEvent.change(subject.getByLabelText(label), { target: { value: value } });
  };

  const selectByValue = (label: string, value: string) => {
    fireEvent.mouseDown(subject.getByLabelText(label));
    const listbox = within(subject.getByRole("listbox"));
    fireEvent.click(listbox.getByTestId(value));
  };

  const selectByText = (label: string, value: string) => {
    fireEvent.mouseDown(subject.getByLabelText(label));
    const listbox = within(subject.getByRole("listbox"));
    fireEvent.click(listbox.getByText(value));
  };

  const clickSave = (): void => {
    fireEvent.click(subject.getAllByTestId("save")[0]);
  };

  const clickBack = (): void => {
    fireEvent.click(subject.getAllByTestId("back")[0]);
  };

  const getBusinessNameValue = (): string =>
    (subject.queryByLabelText("Business name") as HTMLInputElement)?.value;

  const getEntityIdValue = (): string => (subject.queryByLabelText("Entity id") as HTMLInputElement)?.value;

  const getDateOfFormation = (): string =>
    (subject.queryByLabelText("Date of formation") as HTMLInputElement)?.value;

  const getNotesValue = (): string => (subject.queryByLabelText("Notes") as HTMLInputElement)?.value;

  const getTaxIdValue = (): string => (subject.queryByLabelText("Tax id") as HTMLInputElement)?.value;

  const getEmployerIdValue = (): string =>
    (subject.queryByLabelText("Employer id") as HTMLInputElement)?.value;

  const getIndustryValue = (): string => (subject.queryByTestId("industryid") as HTMLInputElement)?.value;

  const getMunicipalityValue = (): string =>
    (subject.queryByTestId("municipality") as HTMLInputElement)?.value;

  const getLegalStructureValue = (): string =>
    (subject.queryByTestId("legal-structure") as HTMLInputElement)?.value;

  const getExistingEmployeesValue = (): string =>
    (subject.getByLabelText("Existing employees") as HTMLInputElement).value;

  const getTaxPinValue = (): string => (subject.getByLabelText("Tax pin") as HTMLInputElement).value;

  const getRadioButtonFromFormControlLabel = (dataTestId: string): HTMLInputElement =>
    within(subject.getByTestId(dataTestId) as HTMLInputElement).getByRole("radio");
});
