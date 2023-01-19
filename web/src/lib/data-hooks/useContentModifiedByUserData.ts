import { useUserData } from "@/lib/data-hooks/useUserData";
import { templateEval, templateEvalWithExtraSpaceRemoval } from "@/lib/utils/helpers";

export const useContentModifiedByUserData = (content: string) => {
  const { userData } = useUserData();
  let result = content;
  if (!userData || !result) return result;

  if (content.includes("{oos}")) {
    if (userData?.profileData.businessPersona === "FOREIGN") {
      result = templateEval(content, {
        oos: "out-of-state",
      });
    } else if (userData?.profileData.businessPersona) {
      result = templateEvalWithExtraSpaceRemoval(content, {
        oos: "",
      });
    }
  }
  return result;
};
