import { getNonEssentialQuestionText } from "@/lib/domain-logic/getNonEssentialQuestionText";
import { sendChangedNonEssentialQuestionAnalytics } from "@/lib/domain-logic/sendChangedNonEssentialQuestionAnalytics";
import analytics from "@/lib/utils/analytics";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { generateProfileData } from "@businessnjgovnavigator/shared/test/factories";

jest.mock("@/lib/domain-logic/getNonEssentialQuestionText", () => ({
  getNonEssentialQuestionText: jest.fn(),
}));

jest.mock("@/lib/utils/analytics", () => ({
  event: {
    non_essential_question_set: {
      view: {
        non_essential_question_set: jest.fn(),
      },
    },
  },
}));

describe("sendChangedNonEssentialQuestionAnalytics", () => {
  let prevProfile: ProfileData | null;
  let newProfile: ProfileData | null;

  beforeEach(() => {
    jest.clearAllMocks();

    prevProfile = null;
    newProfile = null;
  });

  it("send analytics when a nonEssentialRadioAnswers field changes", () => {
    (getNonEssentialQuestionText as jest.Mock).mockReturnValue("Question Text");

    prevProfile = generateProfileData({
      nonEssentialRadioAnswers: {},
      raffleBingoGames: undefined,
      elevatorOwningBusiness: undefined,
      homeBasedBusiness: undefined,
      plannedRenovationQuestion: undefined,
    });

    newProfile = generateProfileData({
      nonEssentialRadioAnswers: { q1: true },
      raffleBingoGames: undefined,
      elevatorOwningBusiness: undefined,
      homeBasedBusiness: undefined,
      plannedRenovationQuestion: undefined,
    });

    sendChangedNonEssentialQuestionAnalytics(prevProfile, newProfile);

    expect(
      analytics.event.non_essential_question_set.view.non_essential_question_set,
    ).toHaveBeenCalledWith("q1", "Yes");
  });

  it("does not send analytics when nonEssentialRadioAnswers  does not change", () => {
    (getNonEssentialQuestionText as jest.Mock).mockReturnValue("Question Text");

    prevProfile = generateProfileData({
      nonEssentialRadioAnswers: { q1: true },
    });

    newProfile = prevProfile;
    sendChangedNonEssentialQuestionAnalytics(prevProfile, newProfile);
    expect(
      analytics.event.non_essential_question_set.view.non_essential_question_set,
    ).not.toHaveBeenCalledWith("q1", "Yes");
  });

  it("send analytics when a carnival ride business radio answer field changes", () => {
    (getNonEssentialQuestionText as jest.Mock).mockReturnValue("Question Text");

    prevProfile = generateProfileData({
      nonEssentialRadioAnswers: {},
      raffleBingoGames: undefined,
      elevatorOwningBusiness: undefined,
      homeBasedBusiness: undefined,
      plannedRenovationQuestion: undefined,
    });

    newProfile = generateProfileData({
      nonEssentialRadioAnswers: { carnivalRideOwningBusiness: false },
      raffleBingoGames: undefined,
      elevatorOwningBusiness: undefined,
      homeBasedBusiness: undefined,
      plannedRenovationQuestion: undefined,
    });
    sendChangedNonEssentialQuestionAnalytics(prevProfile, newProfile);

    expect(
      analytics.event.non_essential_question_set.view.non_essential_question_set,
    ).toHaveBeenCalledWith("carnivalRideOwningBusiness", "No");
  });

  it("send analytics when a non essential raffle bingo radio answer field changes", () => {
    (getNonEssentialQuestionText as jest.Mock).mockReturnValue("Question Text");

    prevProfile = generateProfileData({
      nonEssentialRadioAnswers: {},
      raffleBingoGames: undefined,
      elevatorOwningBusiness: undefined,
      homeBasedBusiness: undefined,
      plannedRenovationQuestion: undefined,
    });

    newProfile = generateProfileData({
      nonEssentialRadioAnswers: {},
      raffleBingoGames: true,
      elevatorOwningBusiness: undefined,
      homeBasedBusiness: undefined,
      plannedRenovationQuestion: undefined,
    });

    sendChangedNonEssentialQuestionAnalytics(prevProfile, newProfile);

    expect(
      analytics.event.non_essential_question_set.view.non_essential_question_set,
    ).toHaveBeenCalledWith("raffleBingoGames", "Yes");
  });

  it("send analytics when a non essential traveling Circus Or Carnival Owning Business radio answer field changes", () => {
    (getNonEssentialQuestionText as jest.Mock).mockReturnValue("Question Text");

    prevProfile = generateProfileData({
      nonEssentialRadioAnswers: {},
      raffleBingoGames: undefined,
      elevatorOwningBusiness: undefined,
      homeBasedBusiness: undefined,
      plannedRenovationQuestion: undefined,
    });

    newProfile = generateProfileData({
      nonEssentialRadioAnswers: {
        travelingCircusOrCarnivalOwningBusiness: true,
      },
      raffleBingoGames: undefined,
      elevatorOwningBusiness: undefined,
      homeBasedBusiness: undefined,
      plannedRenovationQuestion: undefined,
    });

    sendChangedNonEssentialQuestionAnalytics(prevProfile, newProfile);

    expect(
      analytics.event.non_essential_question_set.view.non_essential_question_set,
    ).toHaveBeenCalledWith("travelingCircusOrCarnivalOwningBusiness", "Yes");
  });

  it("send analytics when a non essential Vacant Property Owner radio answer field changes", () => {
    (getNonEssentialQuestionText as jest.Mock).mockReturnValue("Question Text");

    prevProfile = generateProfileData({
      nonEssentialRadioAnswers: { vacantPropertyOwner: false },
      raffleBingoGames: undefined,
      elevatorOwningBusiness: undefined,
      homeBasedBusiness: undefined,
      plannedRenovationQuestion: undefined,
    });

    newProfile = generateProfileData({
      nonEssentialRadioAnswers: {
        vacantPropertyOwner: true,
      },
      raffleBingoGames: undefined,
      elevatorOwningBusiness: undefined,
      homeBasedBusiness: undefined,
      plannedRenovationQuestion: undefined,
    });

    sendChangedNonEssentialQuestionAnalytics(prevProfile, newProfile);

    expect(
      analytics.event.non_essential_question_set.view.non_essential_question_set,
    ).toHaveBeenCalledWith("vacantPropertyOwner", "Yes");
  });

  it("send analytics when a non essential has Elevator Owning Business radio answer field changes", () => {
    (getNonEssentialQuestionText as jest.Mock).mockReturnValue("Question Text");

    prevProfile = generateProfileData({
      nonEssentialRadioAnswers: {},
      raffleBingoGames: undefined,
      elevatorOwningBusiness: undefined,
      homeBasedBusiness: undefined,
      plannedRenovationQuestion: undefined,
    });

    newProfile = generateProfileData({
      nonEssentialRadioAnswers: {},
      raffleBingoGames: undefined,
      elevatorOwningBusiness: true,
      homeBasedBusiness: undefined,
      plannedRenovationQuestion: undefined,
    });

    sendChangedNonEssentialQuestionAnalytics(prevProfile, newProfile);

    expect(
      analytics.event.non_essential_question_set.view.non_essential_question_set,
    ).toHaveBeenCalledWith("elevatorOwningBusiness", "Yes");
  });

  it("send analytics when a non essential has Home Based Business radio answer field changes", () => {
    (getNonEssentialQuestionText as jest.Mock).mockReturnValue("Question Text");

    prevProfile = generateProfileData({
      nonEssentialRadioAnswers: {},
      raffleBingoGames: undefined,
      elevatorOwningBusiness: undefined,
      homeBasedBusiness: undefined,
      plannedRenovationQuestion: undefined,
    });

    newProfile = generateProfileData({
      nonEssentialRadioAnswers: {},
      raffleBingoGames: undefined,
      elevatorOwningBusiness: undefined,
      homeBasedBusiness: true,
      plannedRenovationQuestion: undefined,
    });

    sendChangedNonEssentialQuestionAnalytics(prevProfile, newProfile);

    expect(
      analytics.event.non_essential_question_set.view.non_essential_question_set,
    ).toHaveBeenCalledWith("homeBasedBusiness", "Yes");
  });

  it("send analytics when a non essential Planned Renovation radio answer field changes", () => {
    (getNonEssentialQuestionText as jest.Mock).mockReturnValue("Question Text");

    prevProfile = generateProfileData({
      nonEssentialRadioAnswers: {},
      raffleBingoGames: undefined,
      elevatorOwningBusiness: undefined,
      homeBasedBusiness: undefined,
      plannedRenovationQuestion: undefined,
    });

    newProfile = generateProfileData({
      nonEssentialRadioAnswers: {},
      raffleBingoGames: undefined,
      elevatorOwningBusiness: undefined,
      homeBasedBusiness: undefined,
      plannedRenovationQuestion: true,
    });

    sendChangedNonEssentialQuestionAnalytics(prevProfile, newProfile);

    expect(
      analytics.event.non_essential_question_set.view.non_essential_question_set,
    ).toHaveBeenCalledWith("plannedRenovationQuestion", "Yes");
  });
});
