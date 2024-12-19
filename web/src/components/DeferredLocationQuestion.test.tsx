import { DeferredLocationQuestion } from "@/components/DeferredLocationQuestion";
import { getMergedConfig } from "@/contexts/configContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import analytics from "@/lib/utils/analytics";
import { generateRoadmap } from "@/test/factories";
import { withRoadmap } from "@/test/helpers/helpers-renderers";
import { selectLocationByText } from "@/test/helpers/helpers-testing-library-selectors";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { Municipality } from "@businessnjgovnavigator/shared/municipality";
import {
  generateBusiness,
  generateMunicipality,
  generateProfileData,
  generateUserData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen } from "@testing-library/react";

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      task_location_question: {
        submit: {
          location_entered_for_first_time: jest.fn(),
        },
      },
    },
  };
}

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;
const Config = getMergedConfig();
const userData = generateUserData({});

describe("<DeferredLocationQuestion />", () => {
  let setRoadmap: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
    setRoadmap = jest.fn();
  });

  const renderComponent = ({
    initialBusiness,
    innerContent,
    municipalities,
  }: {
    initialBusiness: Business;
    innerContent?: string;
    municipalities?: Municipality[];
  }): void => {
    render(
      withRoadmap({
        component: (
          <MunicipalitiesContext.Provider value={{ municipalities: municipalities ?? [] }}>
            <WithStatefulUserData initialUserData={generateUserDataForBusiness(initialBusiness)}>
              <DeferredLocationQuestion innerContent={innerContent ?? ""} />
            </WithStatefulUserData>
          </MunicipalitiesContext.Provider>
        ),
        initialRoadmap: generateRoadmap({}),
        mockSetRoadmapFunction: setRoadmap,
      })
    );
  };

  it("shows location question and not inner content if location is not yet answered", () => {
    const business = generateBusiness(userData, {
      profileData: generateProfileData({ municipality: undefined }),
    });
    renderComponent({ initialBusiness: business, innerContent: "inner-content" });
    expect(screen.getByText(Config.deferredLocation.header)).toBeInTheDocument();
    expect(screen.queryByText("inner-content")).not.toBeInTheDocument();
    expect(screen.queryByTestId("city-success-banner")).not.toBeInTheDocument();
  });

  it("shows inner content without question nor success banner when already location saved", () => {
    const municipality = generateMunicipality({});
    const business = generateBusiness(userData, { profileData: generateProfileData({ municipality }) });
    renderComponent({ initialBusiness: business, innerContent: "inner-content" });
    expect(screen.queryByText(Config.deferredLocation.header)).not.toBeInTheDocument();
    expect(screen.getByText("inner-content")).toBeInTheDocument();
    expect(screen.queryByTestId("city-success-banner")).not.toBeInTheDocument();
  });

  describe("when saving location", () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const absecon = generateMunicipality({ displayName: "Absecon" });
    const business = generateBusiness(userData, {
      profileData: generateProfileData({ municipality: undefined }),
    });

    const selectNewarkAndSave = async (): Promise<void> => {
      renderComponent({
        initialBusiness: business,
        innerContent: "inner-content",
        municipalities: [newark, absecon],
      });

      selectLocationByText("Newark");
      fireEvent.click(screen.getByText(Config.deferredLocation.deferredOnboardingSaveButtonText));
      await screen.findByTestId("city-success-banner");
    };

    it("saves municipality to profile", async () => {
      await selectNewarkAndSave();
      expect(currentBusiness().profileData.municipality).toEqual(newark);
    });

    it("shows inner content and banner on save", async () => {
      await selectNewarkAndSave();
      expect(screen.queryByText(Config.deferredLocation.header)).not.toBeInTheDocument();
      expect(screen.getByText("inner-content")).toBeInTheDocument();
    });

    it("shows location question when edit button is clicked", async () => {
      await selectNewarkAndSave();
      fireEvent.click(screen.getByText(Config.deferredLocation.editText));
      expect(screen.getByText(Config.deferredLocation.header)).toBeInTheDocument();
      expect(screen.queryByTestId("city-success-banner")).not.toBeInTheDocument();
    });

    it("shows inner content when saving location after editing", async () => {
      await selectNewarkAndSave();
      fireEvent.click(screen.getByText(Config.deferredLocation.editText));
      selectLocationByText("Absecon");
      fireEvent.click(screen.getByText(Config.deferredLocation.deferredOnboardingSaveButtonText));
      await screen.findByTestId("city-success-banner");
      expect(screen.getByText("inner-content")).toBeInTheDocument();
    });

    it("removes municipality from user profile when clicking remove button", async () => {
      await selectNewarkAndSave();
      fireEvent.click(screen.getByText(Config.deferredLocation.removeText));
      expect(currentBusiness().profileData.municipality).toEqual(undefined);
    });

    it("shows question and removes inner-content/success banner when removing location", async () => {
      await selectNewarkAndSave();
      fireEvent.click(screen.getByText(Config.deferredLocation.removeText));
      expect(screen.getByText(Config.deferredLocation.header)).toBeInTheDocument();
      expect(screen.queryByTestId("city-success-banner")).not.toBeInTheDocument();
      expect(screen.queryByText("inner-content")).not.toBeInTheDocument();
    });

    it("sends analytics when municipality entered for first time", async () => {
      await selectNewarkAndSave();
      expect(
        mockAnalytics.event.task_location_question.submit.location_entered_for_first_time
      ).toHaveBeenCalled();
    });
  });
});
