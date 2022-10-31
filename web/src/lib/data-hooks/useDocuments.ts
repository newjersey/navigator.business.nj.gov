import { getSignedS3Link } from "@/lib/auth/sessionHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { ProfileDocuments } from "@businessnjgovnavigator/shared/";
import { useState } from "react";

export const useDocuments = (): {
  documents: ProfileDocuments | undefined;
  checkData: () => Promise<void>;
} => {
  const { userData } = useUserData();
  const [documents, setDocuments] = useState<ProfileDocuments | undefined>(undefined);

  const checkData = async (): Promise<void> => {
    const formationDoc = userData?.profileData.documents.formationDoc
      ? await getSignedS3Link(userData?.profileData.documents.formationDoc)
      : "";
    const certifiedDoc = userData?.profileData.documents.certifiedDoc
      ? await getSignedS3Link(userData?.profileData.documents.certifiedDoc)
      : "";
    const standingDoc = userData?.profileData.documents.standingDoc
      ? await getSignedS3Link(userData?.profileData.documents.standingDoc)
      : "";

    return setDocuments({ formationDoc, certifiedDoc, standingDoc });
  };

  useMountEffectWhenDefined(() => {
    if (!userData) {
      return;
    }
    checkData();
    const interval = setInterval(() => {
      return checkData();
    }, 900000);
    return () => {
      return clearInterval(interval);
    };
  }, userData);

  return { documents, checkData };
};
