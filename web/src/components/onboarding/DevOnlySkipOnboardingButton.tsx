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
      municipality: {
        displayName: "Newark",
        name: "Newark",
        county: "",
        id: "12345",
      },
    });
    props.setPage({ current: 5, previous: 4 });
    props.routeToPage(5);
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
