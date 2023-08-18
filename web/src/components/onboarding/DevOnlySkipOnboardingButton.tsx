import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ReactElement, useContext } from "react";

interface Props {
  setPage: (page: { current: number; previous: number }) => void;
  routeToPage: (page: number) => void;
}

export const DevOnlySkipOnboardingButton = (props: Props): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);

  const devOnlySkipOnboarding = (): void => {
    setProfileData({
      ...emptyProfileData,
      businessPersona: "STARTING",
      industryId: "generic"
    });
    props.setPage({ current: 2, previous: 1 });
    props.routeToPage(2);
  };

  if (state.page === 1 && process.env.NODE_ENV === "development") {
    return (
      <SecondaryButton isColor="primary" onClick={devOnlySkipOnboarding}>
        skip
      </SecondaryButton>
    );
  } else {
    return <></>;
  }
};
