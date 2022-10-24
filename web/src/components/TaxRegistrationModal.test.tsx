import { getMergedConfig } from "@/contexts/configContext";
import { getFlow } from "@/lib/utils/helpers";
import { generateProfileData, generateUserData } from "@/test/factories";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { LookupOwnershipTypeById } from "@businessnjgovnavigator/shared/index";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen } from "@testing-library/react";
import { TaxRegistrationModal } from "./TaxRegistrationModal";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
const modalOnClose = jest.fn();
const onSave = jest.fn();
const Config = getMergedConfig();

const renderWithUserData = (userData: Partial<UserData>) => {
  render(
    <WithStatefulUserData initialUserData={generateUserData(userData)}>
      <TaxRegistrationModal isOpen={true} close={modalOnClose} onSave={onSave} />
    </WithStatefulUserData>
  );
};

describe("<TaxRegistrationModal/>", () => {
  let userData: UserData;

  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
    userData = generateUserData({
      profileData: generateProfileData({
        legalStructureId: "limited-liability-partnership",
        businessPersona: "STARTING",
      }),
    });
  });

  it("does not close model and fires validation for tax id less than 12 digits", () => {
    renderWithUserData({
      ...userData,
      profileData: {
        ...userData.profileData,
        businessName: "NJ Services",
        taxId: "",
        ownershipTypeIds: ["woman-owned"],
        existingEmployees: "3",
      },
    });
    fireEvent.click(screen.getByLabelText("Tax id"));
    fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "123456" } });
    fireEvent.blur(screen.getByLabelText("Tax id"));
    fireEvent.click(screen.getByTestId("modal-button-primary"));
    expect(modalOnClose).not.toHaveBeenCalled();
    expect(
      screen.getByText(Config.profileDefaults[getFlow(userData.profileData)].taxId.errorTextRequired)
    ).toBeInTheDocument();
  });

  it("displays businessName field when it is not in profileData", () => {
    renderWithUserData({
      ...userData,
      profileData: {
        ...userData.profileData,
        businessName: "",
        taxId: "123456789000",
        ownershipTypeIds: ["woman-owned"],
        existingEmployees: "3",
      },
    });
    expect(screen.getByLabelText("Business name")).toBeInTheDocument();
  });

  it("pre-populates user data from profile data", () => {
    renderWithUserData({
      ...userData,
      profileData: {
        ...userData.profileData,
        businessName: "NJ Services",
        taxId: "123456789000",
        ownershipTypeIds: ["woman-owned"],
        existingEmployees: "3",
      },
    });
    const woman = LookupOwnershipTypeById("woman-owned").name;

    expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual("123-456-789/000");
    expect(screen.queryByLabelText("Business name")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Ownership")).toHaveTextContent(`${woman}`);
    expect((screen.getByLabelText("Existing employees") as HTMLInputElement).value).toEqual("3");
  });
});
