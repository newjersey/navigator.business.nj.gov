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
    const profileData = generateProfileData({ industryId }); // calls math.random 7 times

    const business = generateBusiness({ profileData }); // calls math.random 10 times

    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
        <CannabisLocationAlert industryId={industryId} />
      </WithStatefulUserData>
    );
  };

  beforeEach(() => {
    console.log("test hihih");
    jest.resetAllMocks();
  });

  it("is displayed for cannabis businesses", () => {
    expect(Math.random()).toEqual(4);
    renderWithBusiness("cannabis");
    expect(screen.getByText(Config.profileDefaults.default.cannabisLocationAlert)).toBeInTheDocument();
  });

  it("is NOT displayed for non-cannabis businesses [logRandomSeed]", () => {
    const filter = (industry: Industry): boolean => industry.id !== "cannabis";
    expect(Math.random()).toEqual(4);
    const industry = filterRandomIndustry(filter);

    renderWithBusiness(industry.id);
    expect(screen.queryByText(Config.profileDefaults.default.cannabisLocationAlert)).not.toBeInTheDocument();
  });

  it("is NOT displayed when industry is undefined", () => {
    expect(Math.random()).toEqual(4);
    renderWithBusiness();
    expect(screen.queryByText(Config.profileDefaults.default.cannabisLocationAlert)).not.toBeInTheDocument();
  });
});
