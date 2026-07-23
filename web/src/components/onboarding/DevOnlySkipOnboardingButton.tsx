import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { businessStructureTaskId } from "@businessnjgovnavigator/shared/";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ReactElement, useContext } from "react";

interface Props {
  setPage: (page: { current: number; previous: number }) => void;
  routeToPage: (page: number) => Promise<boolean>;
}

export const DevOnlySkipOnboardingButton = (props: Props): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { updateQueue } = useUserData();

  const devOnlySkipOnboarding = async (): Promise<void> => {
    setProfileData({
      ...emptyProfileData,
      businessPersona: "STARTING",
      industryId: "generic",
      legalStructureId: "c-corporation",
    });
    props.setPage({ current: 2, previous: 1 });
    await props.routeToPage(2);
    updateQueue?.queueTaskProgress({
      [businessStructureTaskId]: "COMPLETED",
    });
    updateQueue?.updateInBackground();
  };

  if (state.page === 1 && process.env.NODE_ENV === "development") {
    return (
      <div className="margin-top-2">
        <PrimaryButton isColor="accent-cooler" onClick={devOnlySkipOnboarding}>
          skip
        </PrimaryButton>
      </div>
    );
  } else {
    return <></>;
  }
};
