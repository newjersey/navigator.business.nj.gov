import { ConfigContext, getMergedConfig } from "@/contexts/configContext";
import WelcomePage from "@/pages/welcome";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { render, screen } from "@testing-library/react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/utils/useIntersectionOnElement", () => ({ useIntersectionOnElement: jest.fn() }));

const Config = getMergedConfig();

describe("HomePage", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockUserData({});
  });

  it("renders landingPageExperienceWelcome content when visiting welcome page URL", () => {
    render(
      <ConfigContext.Provider
        value={{
          config: {
            ...Config,
            landingPageExperienceWelcome: {
              section3SupportingText: "Soma is available to help all new business Users globally",
            } as unknown as typeof Config.landingPageExperienceWelcome,
          },
          setOverrides: (): undefined => void {},
        }}
      >
        <WelcomePage />
      </ConfigContext.Provider>
    );
    expect(screen.getByText("Soma is available to help all new business Users globally")).toBeInTheDocument();
  });
});
