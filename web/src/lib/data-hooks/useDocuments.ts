import { getSignedS3Link } from "@/lib/auth/sessionHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { ProfileDocuments } from "@businessnjgovnavigator/shared/";
import { useState } from "react";

export const useDocuments = (): {
  documents: ProfileDocuments | undefined;
  checkData: () => Promise<void>;
} => {
  const { business } = useUserData();
  const [documents, setDocuments] = useState<ProfileDocuments | undefined>(undefined);

  const checkData = async (): Promise<void> => {
    const formationDoc = business?.profileData.documents.formationDoc
      ? await getSignedS3Link(business?.profileData.documents.formationDoc)
      : "";
    const certifiedDoc = business?.profileData.documents.certifiedDoc
      ? await getSignedS3Link(business?.profileData.documents.certifiedDoc)
      : "";
    const standingDoc = business?.profileData.documents.standingDoc
      ? await getSignedS3Link(business?.profileData.documents.standingDoc)
      : "";

    return setDocuments({ formationDoc, certifiedDoc, standingDoc });
  };

  useMountEffectWhenDefined(() => {
    if (!business) return;
    checkData();
    const interval = setInterval(() => {
      return checkData();
    }, 900000);
    return (): void => {
      return clearInterval(interval);
    };
  }, business);

  return { documents, checkData };
};
