import { useUserData } from "@/lib/data-hooks/useUserData";
import { templateEval, templateEvalWithExtraSpaceRemoval } from "@/lib/utils/helpers";

export const useContentModifiedByUserData = (content: string): string => {
  const { userData } = useUserData();
  let result = content;
  if (!userData || !result) return result;

  if (content.includes("${oos}")) {
    if (userData?.profileData.businessPersona === "FOREIGN") {
      result = templateEval(content, {
        oos: "out-of-state",
      });
    } else {
      result = templateEvalWithExtraSpaceRemoval(content, {
        oos: "",
      });
    }
  }

  if (content.includes("${OoS}")) {
    if (userData?.profileData.businessPersona === "FOREIGN") {
      result = templateEval(content, {
        OoS: "Out-of-State",
      });
    } else {
      result = templateEvalWithExtraSpaceRemoval(content, {
        OoS: "",
      });
    }
  }

  return result;
};
