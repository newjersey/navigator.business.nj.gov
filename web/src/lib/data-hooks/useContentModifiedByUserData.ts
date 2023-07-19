import { useUserData } from "@/lib/data-hooks/useUserData";
import { modifyContent } from "@/lib/domain-logic/modifyContent";

export const useContentModifiedByUserData = (content: string): string => {
  const { business } = useUserData();
  if (!business || !content) return content;

  return modifyContent({
    content,
    condition: () => business?.profileData.businessPersona === "FOREIGN",
    modificationMap: {
      oos: "out-of-state",
      OoS: "Out-of-State",
    },
  });
};
