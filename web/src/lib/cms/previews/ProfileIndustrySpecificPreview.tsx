import { FieldLabelOnboarding } from "@/components/onboarding/FieldLabelOnboarding";
import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { OnboardingEmploymentAgency } from "@/components/onboarding/OnboardingEmploymentAgency";
import { OnboardingHomeBasedBusiness } from "@/components/onboarding/OnboardingHomeBasedBusiness";
import { OnboardingHomeContractor } from "@/components/onboarding/OnboardingHomeContractor";
import { OnboardingRadioQuestion } from "@/components/onboarding/OnboardingRadioQuestion";
import { ConfigContext } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { getMetadataFromSlug, PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ProfileContentField } from "@/lib/types/types";
import {
  createEmptyProfileData,
  IndustrySpecificData,
  industrySpecificDataChoices,
} from "@businessnjgovnavigator/shared/profileData";
import { EssentialQuestions } from "../../domain-logic/essentialQuestions";

const ProfilePreviewIndustrySpecific = (props: PreviewProps) => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const { businessPersona } = getMetadataFromSlug(props.entry.toJS().slug);

  const getEssentialQuestions = () => {
    return EssentialQuestions.map((props) => {
      return (
        <>
          <FieldLabelProfile fieldName={props.contentFieldName ?? (props.fieldName as ProfileContentField)} />
          <OnboardingRadioQuestion<IndustrySpecificData[keyof IndustrySpecificData]>
            {...props}
            choices={industrySpecificDataChoices[props.fieldName]}
          />
          <hr className="margin-y-4" />
        </>
      );
    });
  };

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <ProfileDataContext.Provider
          value={{
            state: {
              profileData: createEmptyProfileData(),
              flow: businessPersona || "STARTING",
              municipalities: [],
            },
            setUser: () => {},
            setProfileData: () => {},
            onBack: () => {},
          }}
        >
          <h1>Preview Fields</h1>
          <OnboardingEmploymentAgency />
          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="homeBasedBusiness" />
          <OnboardingHomeBasedBusiness />
          <hr className="margin-y-4" />
          <OnboardingHomeContractor />
          <hr className="margin-y-4" />
          {getEssentialQuestions()}
        </ProfileDataContext.Provider>
      </div>
    </ConfigContext.Provider>
  );
};

export default ProfilePreviewIndustrySpecific;
