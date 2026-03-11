import { IndustryDropdown } from "@/components/data-fields/IndustryDropdown";
import { WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import {
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { randomInt } from "@businessnjgovnavigator/shared/intHelpers";
import {
  generateBusiness,
  generateProfileData,
  generateUser,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { LookupIndustryById } from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen, within } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("Industry Dropdown", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
  });

  it("displays the Generic Industry as the first item in the dropdown list for ExperienceA", () => {
    const business = generateBusiness({ profileData: generateProfileData({}) });
    const userData = generateUserDataForBusiness(business, {
      user: generateUser({ id: business.userId, abExperience: "ExperienceA" }),
    });

    render(
      <WithStatefulUserData initialUserData={userData}>
        <WithStatefulProfileData initialData={business.profileData}>
          <IndustryDropdown />
        </WithStatefulProfileData>
      </WithStatefulUserData>,
    );

    fireEvent.mouseDown(screen.getByLabelText("Industry"));
    const items = within(screen.getByRole("listbox")).getAllByRole("option");

    expect(within(items[0]).getByTestId("generic")).toBeInTheDocument();
  });

  it("displays the generic industry as the single option when there is no industry match", async () => {
    const business = generateBusiness({ profileData: generateProfileData({}) });
    const userData = generateUserDataForBusiness(business, {
      user: generateUser({ id: business.userId, abExperience: "ExperienceA" }),
    });

    render(
      <WithStatefulUserData initialUserData={userData}>
        <WithStatefulProfileData initialData={business.profileData}>
          <IndustryDropdown />
        </WithStatefulProfileData>
      </WithStatefulUserData>,
    );

    const searchTerm = `some-industry-${randomInt()}`;

    fireEvent.click(screen.getByLabelText("Industry"));
    fireEvent.change(screen.getByLabelText("Industry"), {
      target: { value: searchTerm },
    });

    fireEvent.click(screen.getByLabelText("Industry"));
    expect(screen.getByTestId("generic")).toBeInTheDocument();
    expect(screen.getAllByText(searchTerm).length).toEqual(1);
    expect(screen.queryByTestId("certified-public-accountant")).not.toBeInTheDocument();
  });

  it("displays search affirmation when there is an input", () => {
    const business = generateBusiness({ profileData: generateProfileData({}) });
    const userData = generateUserDataForBusiness(business, {
      user: generateUser({ id: business.userId, abExperience: "ExperienceA" }),
    });

    render(
      <WithStatefulUserData initialUserData={userData}>
        <WithStatefulProfileData initialData={business.profileData}>
          <IndustryDropdown />
        </WithStatefulProfileData>
      </WithStatefulUserData>,
    );

    const inputElement = screen.getByLabelText("Industry");
    fireEvent.click(inputElement);
    expect(screen.queryByTestId("search-affirmation")).not.toBeInTheDocument();

    fireEvent.change(inputElement, { target: { value: "plan" } });
    expect(screen.getByTestId("search-affirmation")).toBeInTheDocument();
  });

  describe("domestic employer industry", () => {
    it("filters out domestic employer industry when businessPersona is 'FOREIGN'", () => {
      const business = generateBusiness({
        profileData: generateProfileData({ businessPersona: "FOREIGN" }),
      });
      const userData = generateUserDataForBusiness(business, {
        user: generateUser({ id: business.userId, abExperience: "ExperienceA" }),
      });

      render(
        <WithStatefulUserData initialUserData={userData}>
          <WithStatefulProfileData initialData={business.profileData}>
            <IndustryDropdown />
          </WithStatefulProfileData>
        </WithStatefulUserData>,
      );

      fireEvent.mouseDown(screen.getByLabelText("Industry"));
      expect(screen.queryByTestId("domestic-employer")).not.toBeInTheDocument();
    });

    it("displays domestic employer as an industry when businessPersona is 'STARTING'", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: undefined,
        }),
      });
      const userData = generateUserDataForBusiness(business, {
        user: generateUser({ id: business.userId, abExperience: "ExperienceA" }),
      });

      render(
        <WithStatefulUserData initialUserData={userData}>
          <WithStatefulProfileData initialData={business.profileData}>
            <IndustryDropdown />
          </WithStatefulProfileData>
        </WithStatefulUserData>,
      );

      fireEvent.mouseDown(screen.getByLabelText("Industry"));
      expect(screen.getByTestId("domestic-employer")).toBeInTheDocument();
    });
  });

  describe("A/B Testing - ExperienceA behavior", () => {
    it("displays selected industry value when user has ExperienceA and industryId is set", () => {
      const business = generateBusiness({
        profileData: generateProfileData({ industryId: "home-contractor" }),
      });
      const userData = generateUserDataForBusiness(business, {
        user: generateUser({ id: business.userId, abExperience: "ExperienceA" }),
      });

      render(
        <WithStatefulUserData initialUserData={userData}>
          <WithStatefulProfileData initialData={business.profileData}>
            <IndustryDropdown />
          </WithStatefulProfileData>
        </WithStatefulUserData>,
      );

      const input = screen.getByTestId("industryId") as HTMLInputElement;
      expect(input.value).toBe("Home Improvement Contractor");
    });

    it("displays empty value when user has ExperienceA and no industryId is set", () => {
      const business = generateBusiness({
        profileData: generateProfileData({ industryId: undefined }),
      });
      const userData = generateUserDataForBusiness(business, {
        user: generateUser({ id: business.userId, abExperience: "ExperienceA" }),
      });

      render(
        <WithStatefulUserData initialUserData={userData}>
          <WithStatefulProfileData initialData={business.profileData}>
            <IndustryDropdown />
          </WithStatefulProfileData>
        </WithStatefulUserData>,
      );

      const input = screen.getByTestId("industryId") as HTMLInputElement;
      expect(input.value).toBe("");
    });

    it("does not show placeholder text for ExperienceA", () => {
      const business = generateBusiness({
        profileData: generateProfileData({ industryId: undefined }),
      });
      const userData = generateUserDataForBusiness(business, {
        user: generateUser({ id: business.userId, abExperience: "ExperienceA" }),
      });

      render(
        <WithStatefulUserData initialUserData={userData}>
          <WithStatefulProfileData initialData={business.profileData}>
            <IndustryDropdown />
          </WithStatefulProfileData>
        </WithStatefulUserData>,
      );

      const input = screen.getByTestId("industryId") as HTMLInputElement;
      expect(input.placeholder).toBe("");
    });

    it("does not move generic to end for ExperienceA", () => {
      const business = generateBusiness({
        profileData: generateProfileData({ industryId: undefined }),
      });
      const userData = generateUserDataForBusiness(business, {
        user: generateUser({ id: business.userId, abExperience: "ExperienceA" }),
      });

      render(
        <WithStatefulUserData initialUserData={userData}>
          <WithStatefulProfileData initialData={business.profileData}>
            <IndustryDropdown />
          </WithStatefulProfileData>
        </WithStatefulUserData>,
      );

      fireEvent.mouseDown(screen.getByLabelText("Industry"));
      const items = within(screen.getByRole("listbox")).getAllByRole("option");

      // Find the "All Other Businesses" option
      const genericIndex = items.findIndex((item) => {
        return within(item).queryByTestId("generic") !== null;
      });

      // For ExperienceA, generic should be first (index 0)
      expect(genericIndex).toBe(0);
    });
  });

  describe("A/B Testing - ExperienceB behavior", () => {
    it("displays selected industry value when user has ExperienceB and industryId is set", () => {
      const industryId = "home-contractor";
      const business = generateBusiness({
        profileData: generateProfileData({ industryId }),
      });
      const userData = generateUserDataForBusiness(business, {
        user: generateUser({ id: business.userId, abExperience: "ExperienceB" }),
      });

      render(
        <WithStatefulUserData initialUserData={userData}>
          <WithStatefulProfileData initialData={business.profileData}>
            <IndustryDropdown />
          </WithStatefulProfileData>
        </WithStatefulUserData>,
      );

      const input = screen.getByTestId("industryId") as HTMLInputElement;
      // For ExperienceB, the selected value should be retained and displayed
      const expectedIndustryName = LookupIndustryById(industryId).name;
      expect(input.value).toBe(expectedIndustryName);
    });

    it("shows placeholder text for ExperienceB", () => {
      const business = generateBusiness({
        profileData: generateProfileData({ industryId: undefined }),
      });
      const userData = generateUserDataForBusiness(business, {
        user: generateUser({ id: business.userId, abExperience: "ExperienceB" }),
      });

      render(
        <WithStatefulUserData initialUserData={userData}>
          <WithStatefulProfileData initialData={business.profileData}>
            <IndustryDropdown />
          </WithStatefulProfileData>
        </WithStatefulUserData>,
      );

      const input = screen.getByTestId("industryId") as HTMLInputElement;
      expect(input.placeholder).toBe("Type your industry here");
    });

    it("moves 'All Other Businesses' (generic) to the end of filtered results for ExperienceB", () => {
      const business = generateBusiness({
        profileData: generateProfileData({ industryId: undefined }),
      });
      const userData = generateUserDataForBusiness(business, {
        user: generateUser({ id: business.userId, abExperience: "ExperienceB" }),
      });

      render(
        <WithStatefulUserData initialUserData={userData}>
          <WithStatefulProfileData initialData={business.profileData}>
            <IndustryDropdown />
          </WithStatefulProfileData>
        </WithStatefulUserData>,
      );

      fireEvent.mouseDown(screen.getByLabelText("Industry"));
      const items = within(screen.getByRole("listbox")).getAllByRole("option");

      // Find the "All Other Businesses" option
      const genericIndex = items.findIndex((item) => {
        return within(item).queryByTestId("generic") !== null;
      });

      // For ExperienceB, generic should be last
      expect(genericIndex).toBe(items.length - 1);
    });

    it("keeps generic at the end even after searching for ExperienceB", () => {
      const business = generateBusiness({
        profileData: generateProfileData({ industryId: undefined }),
      });
      const userData = generateUserDataForBusiness(business, {
        user: generateUser({ id: business.userId, abExperience: "ExperienceB" }),
      });

      render(
        <WithStatefulUserData initialUserData={userData}>
          <WithStatefulProfileData initialData={business.profileData}>
            <IndustryDropdown />
          </WithStatefulProfileData>
        </WithStatefulUserData>,
      );

      const input = screen.getByLabelText("Industry");
      fireEvent.click(input);
      fireEvent.change(input, { target: { value: "business" } });

      const items = within(screen.getByRole("listbox")).getAllByRole("option");

      // Find the "All Other Businesses" option if it exists in filtered results
      const genericIndex = items.findIndex((item) => {
        return within(item).queryByTestId("generic") !== null;
      });

      // If generic matches the search, it should still be last
      // If it doesn't match, genericIndex will be -1
      expect(genericIndex === -1 || genericIndex === items.length - 1).toBe(true);
    });
  });
});
