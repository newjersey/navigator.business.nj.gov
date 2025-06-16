import { NonEssentialQuestionForPersonas } from "@/components/data-fields/non-essential-questions/nonEssentialQuestionsHelpers";
import {
  displayAltHomeBasedBusinessDescription,
  displayElevatorQuestion,
  displayHomedBaseBusinessQuestion,
  displayPlannedRenovationQuestion,
} from "@/components/profile/profileDisplayLogicHelpers";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ReactElement, useContext } from "react";

export const LocationBasedNonEssentialQuestions = (): ReactElement => {
  const { business } = useUserData();
  const { state: profileDataState } = useContext(ProfileDataContext);
  const profileData = profileDataState.profileData;
  const displayAltDescriptionForHomeBasedBusinessQuestion =
    displayAltHomeBasedBusinessDescription(profileData);
  return (
    <>
      {displayHomedBaseBusinessQuestion(profileData, business) && (
        <NonEssentialQuestionForPersonas
          questionId={"homeBasedBusiness"}
          displayAltDescription={displayAltDescriptionForHomeBasedBusinessQuestion}
        />
      )}

      {displayPlannedRenovationQuestion(profileData, business) && (
        <NonEssentialQuestionForPersonas questionId={"plannedRenovationQuestion"} />
      )}

      {displayElevatorQuestion(profileData, business) && (
        <NonEssentialQuestionForPersonas questionId={"elevatorOwningBusiness"} />
      )}
    </>
  );
};
