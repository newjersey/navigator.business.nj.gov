import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CongratulatoryModal } from "@/components/CongratulatoryModal";
import { ROUTES } from "@/lib/domain-logic/routes";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";

const Config = getMergedConfig();

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));

describe("<CongratulatoryModal />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
  });

  it("shows link when next section is passed", () => {
    render(
      <CongratulatoryModal nextSectionType="START" open={true} handleClose={(): void => {}} />,
    );

    const link = screen.getByRole("button", {
      name: `${Config.sectionHeaders.START} ${Config.dashboardDefaults.congratulatoryModalLinkText}`,
    });
    fireEvent.click(link);
    expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
  });

  it("navigates when the link is activated with Enter", async () => {
    const user = userEvent.setup();
    render(
      <CongratulatoryModal nextSectionType="START" open={true} handleClose={(): void => {}} />,
    );

    screen
      .getByRole("button", {
        name: `${Config.sectionHeaders.START} ${Config.dashboardDefaults.congratulatoryModalLinkText}`,
      })
      .focus();
    await user.keyboard("{Enter}");
    expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
  });

  it("does not navigate when Tab moves focus past the link", async () => {
    const user = userEvent.setup();
    render(
      <CongratulatoryModal nextSectionType="START" open={true} handleClose={(): void => {}} />,
    );

    screen
      .getByRole("button", {
        name: `${Config.sectionHeaders.START} ${Config.dashboardDefaults.congratulatoryModalLinkText}`,
      })
      .focus();
    await user.tab();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("hides link when no next section is passed", () => {
    render(
      <CongratulatoryModal nextSectionType={undefined} open={true} handleClose={(): void => {}} />,
    );

    const link = screen.queryByRole("button", {
      name: `${Config.sectionHeaders.START} ${Config.dashboardDefaults.congratulatoryModalLinkText}`,
    });
    expect(link).not.toBeInTheDocument();
  });
});
