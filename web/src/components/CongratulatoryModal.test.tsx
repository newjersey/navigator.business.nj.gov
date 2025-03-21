import { CongratulatoryModal } from "@/components/CongratulatoryModal";
import { getMergedConfig } from "@/contexts/configContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { fireEvent, render, screen } from "@testing-library/react";

const Config = getMergedConfig();

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));

describe("<CongratulatoryModal />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
  });

  it("shows link when next section is passed", () => {
    render(<CongratulatoryModal nextSectionType="START" open={true} handleClose={(): void => {}} />);

    const link = screen.queryByText(
      `${Config.sectionHeaders["START"]} ${Config.dashboardDefaults.congratulatoryModalLinkText}`
    );
    expect(link).toBeInTheDocument();
    fireEvent.click(link as HTMLElement);
    expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
  });

  it("hides link when no next section is passed", () => {
    render(<CongratulatoryModal nextSectionType={undefined} open={true} handleClose={(): void => {}} />);

    const link = screen.queryByText(
      `${Config.sectionHeaders["START"]} ${Config.dashboardDefaults.congratulatoryModalLinkText}`
    );
    expect(link).not.toBeInTheDocument();
  });
});
