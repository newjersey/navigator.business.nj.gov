import { ProfileOwnership } from "@/components/profile/ProfileOwnership";
import { selectDropdownByValue } from "@/test/helpers/helpers-testing-library-selectors";
import { WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { createEmptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { render, screen } from "@testing-library/react";

describe("<ProfileOwnership />", () => {
  it("de-selects everything else if None Of The Above is selected", () => {
    render(
      <WithStatefulProfileData initialData={createEmptyProfileData()}>
        <ProfileOwnership />
      </WithStatefulProfileData>,
    );
    selectDropdownByValue("Ownership", "woman-owned");
    selectDropdownByValue("Ownership", "veteran-owned");
    expect(screen.getByTestId("ownership")).toHaveValue("woman-owned,veteran-owned");
    selectDropdownByValue("Ownership", "none");
    expect(screen.getByTestId("ownership")).toHaveValue("none");
  });

  it("de-selects None Of The Above if anything else is selected", () => {
    render(
      <WithStatefulProfileData initialData={createEmptyProfileData()}>
        <ProfileOwnership />
      </WithStatefulProfileData>,
    );
    selectDropdownByValue("Ownership", "none");
    expect(screen.getByTestId("ownership")).toHaveValue("none");
    selectDropdownByValue("Ownership", "veteran-owned");
    expect(screen.getByTestId("ownership")).toHaveValue("veteran-owned");
  });
});
