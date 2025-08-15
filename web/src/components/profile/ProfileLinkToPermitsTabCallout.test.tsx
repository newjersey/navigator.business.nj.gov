import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { fireEvent, render, screen } from "@testing-library/react";
import { ProfileLinkToPermitsTabCallout } from "./ProfileLinkToPermitsTabCallout";

describe("ProfileNonEssentialQuestionsCallout", () => {
  const Config = getMergedConfig();

  it("calls setProfileTab with 'permits' when button is clicked", () => {
    const mockOnClick = jest.fn();

    render(
      <ProfileLinkToPermitsTabCallout permitsRef={{ current: null }} setProfileTab={mockOnClick} />,
    );

    const button = screen.getByText(
      Config.profileDefaults.fields.nonEssentialQuestions.default.linkToPermitsTextButton,
    );

    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith("permits");
  });
});
