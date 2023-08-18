import { templateEval, templateEvalWithExtraSpaceRemoval } from "@/lib/utils/helpers";

export const modifyContent = ({
  content,
  condition,
  modificationMap
}: {
  content: string;
  condition: () => boolean;
  modificationMap: Record<string, string>;
}): string => {
  let result = content;

  for (const modifier of Object.keys(modificationMap)) {
    if (content.includes(`\${${modifier}}`)) {
      if (condition()) {
        result = templateEval(content, {
          [modifier]: modificationMap[modifier]
        });
      } else {
        result = templateEvalWithExtraSpaceRemoval(content, {
          [modifier]: ""
        });
      }
    }
  }

  return result;
};
