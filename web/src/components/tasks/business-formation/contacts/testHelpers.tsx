import { generateFormationDbaContent, generateFormationDisplayContent, generateUser } from "@/test/factories";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  preparePage,
} from "@/test/helpers/helpers-formation";
import {
  BusinessUser,
  castPublicFilingLegalTypeToFormationType,
  FormationFormData,
  generateFormationFormData,
  ProfileData,
  PublicFilingLegalType,
} from "@businessnjgovnavigator/shared";

export const displayContent = {
  formationDisplayContent: generateFormationDisplayContent({}),
  formationDbaContent: generateFormationDbaContent({}),
};

export const getPageHelper = async (
  initialProfileData: Partial<ProfileData>,
  formationFormData: Partial<FormationFormData>,
  initialUser?: Partial<BusinessUser>
): Promise<FormationPageHelpers> => {
  const profileData = generateFormationProfileData(initialProfileData);
  const isForeign = profileData.businessPersona == "FOREIGN";
  const formationData = {
    formationFormData: generateFormationFormData(formationFormData, {
      legalStructureId: castPublicFilingLegalTypeToFormationType(
        profileData.legalStructureId as PublicFilingLegalType,
        profileData.businessPersona
      ),
    }),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
  };
  const user = initialUser ? generateUser(initialUser) : generateUser({});
  const page = preparePage(
    {
      profileData,
      formationData,
      user,
    },
    displayContent
  );

  if (isForeign) {
    await page.fillAndSubmitNexusBusinessNameStep();
  } else {
    await page.fillAndSubmitBusinessNameStep();
  }
  await page.submitBusinessStep();
  return page;
};
