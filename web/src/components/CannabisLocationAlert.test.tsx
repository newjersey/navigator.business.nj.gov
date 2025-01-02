import { CannabisLocationAlert } from "@/components/CannabisLocationAlert";
import { getMergedConfig } from "@/contexts/configContext";
import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { Industry } from "@businessnjgovnavigator/shared/industry";
import {
  filterRandomIndustry,
  generateBusiness,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { render, screen } from "@testing-library/react";

const Config = getMergedConfig();

describe("<CannabisLocationAlert />", () => {
  const renderWithBusiness = (industryId?: string): void => {
    const profileData = generateProfileData({ industryId });
    const business = generateBusiness({ profileData });

    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
        <CannabisLocationAlert industryId={industryId} />
      </WithStatefulUserData>
    );
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("is displayed for cannabis businesses", () => {
    renderWithBusiness("cannabis");
    expect(screen.getByText(Config.profileDefaults.default.cannabisLocationAlert)).toBeInTheDocument();
  });

  it("is NOT displayed for non-cannabis businesses", () => {
    const filter = (industry: Industry): boolean => industry.id !== "cannabis";
    const industry = filterRandomIndustry(filter);

    renderWithBusiness(industry.id);
    expect(screen.queryByText(Config.profileDefaults.default.cannabisLocationAlert)).not.toBeInTheDocument();
  });

  it("is NOT displayed when industry is undefined", () => {
    renderWithBusiness();
    expect(screen.queryByText(Config.profileDefaults.default.cannabisLocationAlert)).not.toBeInTheDocument();
  });
});
