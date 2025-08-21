import { ProfileErrorAlert } from "@/components/profile/ProfileErrorAlert";
import { templateEval } from "@/lib/utils/helpers";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { render, screen, within } from "@testing-library/react";

const Config = getMergedConfig();

describe("<ProfileErrorAlert/>", () => {
  it("displays single field text in header if there is only one error", () => {
    render(<ProfileErrorAlert fieldErrors={["industryId"]} />);
    const profileAlert = screen.getByTestId("profile-error-alert");
    const headerText = templateEval(Config.profileDefaults.default.errorTextBody, {
      fieldText: Config.profileDefaults.default.errorErrorAlertOneField,
    });
    expect(within(profileAlert).getByText(headerText)).toBeInTheDocument();
  });

  it("displays multiple fields text in header if there is only one error", () => {
    render(<ProfileErrorAlert fieldErrors={["industryId", "sectorId"]} />);
    const profileAlert = screen.getByTestId("profile-error-alert");
    const headerText = templateEval(Config.profileDefaults.default.errorTextBody, {
      fieldText: Config.profileDefaults.default.errorAlertMultipleFields,
    });
    expect(within(profileAlert).getByText(headerText)).toBeInTheDocument();
  });

  it("displays nothing if there are no errors", () => {
    render(<ProfileErrorAlert fieldErrors={[]} />);
    expect(screen.queryByTestId("profile-error-alert")).not.toBeInTheDocument();
  });

  it("displays the pet care header when willSellPetCareItems has an error", () => {
    render(<ProfileErrorAlert fieldErrors={["willSellPetCareItems"]} />);
    const profileAlert = screen.getByTestId("profile-error-alert");
    expect(profileAlert).toBeInTheDocument();
    expect(
      within(profileAlert).getByText(Config.profileDefaults.fields.petCareHousing.default.header),
    ).toBeInTheDocument();
  });

  it("displays the constructionType header when residentialConstructionType has an error", () => {
    render(<ProfileErrorAlert fieldErrors={["residentialConstructionType"]} />);
    const profileAlert = screen.getByTestId("profile-error-alert");
    expect(profileAlert).toBeInTheDocument();
    expect(
      within(profileAlert).getByText(Config.profileDefaults.fields.constructionType.default.header),
    ).toBeInTheDocument();
  });

  it("displays the employmentPersonnelServiceType header when employmentPlacementType has an error", () => {
    render(<ProfileErrorAlert fieldErrors={["employmentPlacementType"]} />);
    const profileAlert = screen.getByTestId("profile-error-alert");
    expect(profileAlert).toBeInTheDocument();
    expect(
      within(profileAlert).getByText(
        Config.profileDefaults.fields.employmentPersonnelServiceType.default.header,
      ),
    ).toBeInTheDocument();
  });

  it("displays formation field label instead of profile field header from config", () => {
    render(<ProfileErrorAlert fieldErrors={["addressLine1"]} />);
    const profileAlert = screen.getByTestId("profile-error-alert");
    expect(profileAlert).toBeInTheDocument();
    expect(
      within(profileAlert).getByText(Config.formation.fields.addressLine1.label),
    ).toBeInTheDocument();
  });
});
