import { getSignedS3Link } from "@/lib/auth/sessionHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { ProfileDocuments } from "@businessnjgovnavigator/shared/";
import React from "react";

export const useDocuments = (): {
  documents: ProfileDocuments | undefined;
  checkData: () => Promise<void>;
} => {
  const { userData } = useUserData();
  const [documents, setDocuments] = React.useState<ProfileDocuments | undefined>(undefined);
  const [counter, setCounter] = React.useState<number | undefined>(undefined);

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

    setCounter(15);
    return setDocuments({ formationDoc, certifiedDoc, standingDoc });
  };

  React.useEffect(() => {
    if (counter === undefined || !userData) return;
    if (counter === 0) {
      checkData();
      return;
    }
    const timeout = setTimeout(() => setCounter(counter - 1), 60000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter, userData]);

  useMountEffectWhenDefined(() => checkData(), userData);

  return { documents, checkData };
};
