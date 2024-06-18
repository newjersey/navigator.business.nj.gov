/* eslint-disable jest/expect-expect */
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { setupStatefulUserDataContext } from "@/test/mock/withStatefulUserData";
import {
  Business,
  generateBusiness,
  generateFormationData,
  generateFormationFormData,
  generateMunicipality,
  generateProfileData,
  Municipality,
} from "@businessnjgovnavigator/shared";

import { IsAuthenticated } from "@/lib/auth/AuthContext";
import {
  chooseTab,
  clickSave,
  fillText,
  getBusinessProfileInputFieldName,
  renderPage,
} from "@/test/pages/profile/profile-helpers";
import { fireEvent, screen, waitFor } from "@testing-library/react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ postGetAnnualFilings: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("profile - guest mode", () => {
  let setShowNeedsAccountModal: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    setShowNeedsAccountModal = jest.fn();
    useMockRouter({});
    useMockRoadmap({});
    setupStatefulUserDataContext();
  });

  let initialBusiness: Business;
  const muni: Municipality = generateMunicipality({});

  describe("when prospective business owner", () => {
    beforeEach(() => {
      initialBusiness = generateBusiness({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-company",
        }),
      });
    });

    opensModalWhenEditingNonGuestModeProfileFields();
  });

  describe("when owning a business", () => {
    beforeEach(() => {
      initialBusiness = generateBusiness({
        profileData: generateProfileData({ businessPersona: "OWNING", municipality: muni }),
        formationData: generateFormationData({
          formationFormData: generateFormationFormData({
            addressMunicipality: muni,
          }),
        }),
      });
    });

    opensModalWhenEditingNonGuestModeProfileFields();

    it("opens Needs Account modal when user tries to change Tax PIN", () => {
      renderPage({
        business: initialBusiness,
        isAuthenticated: IsAuthenticated.FALSE,
        setShowNeedsAccountModal,
      });
      chooseTab("numbers");
      fireEvent.change(screen.getByLabelText("Tax pin"), { target: { value: "123456789" } });
      expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
    });
  });

  function opensModalWhenEditingNonGuestModeProfileFields(): void {
    it("user is able to edit name and save", async () => {
      renderPage({
        business: initialBusiness,
        isAuthenticated: IsAuthenticated.FALSE,
        setShowNeedsAccountModal,
      });
      const inputFieldName = getBusinessProfileInputFieldName(initialBusiness);
      fillText(inputFieldName, "Cool Computers");
      clickSave();
      await waitFor(() => {
        return expect(mockRouter.mockPush).toHaveBeenCalled();
      });
    });

    it("opens Needs Account modal when user tries to change EIN", () => {
      renderPage({
        business: initialBusiness,
        isAuthenticated: IsAuthenticated.FALSE,
        setShowNeedsAccountModal,
      });
      chooseTab("numbers");
      fireEvent.change(screen.getByLabelText("Employer id"), { target: { value: "123456789" } });
      expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
    });

    it("opens Needs Account modal when user tries to change entity ID", () => {
      renderPage({
        business: initialBusiness,
        isAuthenticated: IsAuthenticated.FALSE,
        setShowNeedsAccountModal,
      });
      chooseTab("numbers");
      fireEvent.change(screen.getByLabelText("Entity id"), { target: { value: "123456789" } });
      expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
    });

    it("opens Needs Account modal when user tries to change NJ Tax ID", () => {
      renderPage({
        business: initialBusiness,
        isAuthenticated: IsAuthenticated.FALSE,
        setShowNeedsAccountModal,
      });
      chooseTab("numbers");
      fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "123456789" } });
      expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
    });

    it("opens Needs Account modal when user tries to change Notes", () => {
      renderPage({
        business: initialBusiness,
        isAuthenticated: IsAuthenticated.FALSE,
        setShowNeedsAccountModal,
      });
      chooseTab("notes");
      fireEvent.change(screen.getByLabelText("Notes"), { target: { value: "some note" } });
      expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
    });
  }
});
