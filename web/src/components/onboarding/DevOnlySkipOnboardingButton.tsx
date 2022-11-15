import { Button } from "@/components/njwds-extended/Button";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { useContext } from "react";

interface Props {
  setPage: (page: { current: number; previous: number }) => void;
  routeToPage: (page: number) => void;
}

export const DevOnlySkipOnboardingButton = (props: Props) => {
  const { state, setProfileData } = useContext(ProfileDataContext);

  const devOnlySkipOnboarding = () => {
    setProfileData({
      ...emptyProfileData,
      businessPersona: "STARTING",
      industryId: "generic",
      legalStructureId: "limited-liability-company",
    });
    props.setPage({ current: 4, previous: 3 });
    props.routeToPage(4);
  };

  if (state.page === 1 && process.env.NODE_ENV === "development") {
    return (
      <Button style="secondary" onClick={devOnlySkipOnboarding}>
        skip
      </Button>
    );
  } else {
    return <></>;
  }
};
