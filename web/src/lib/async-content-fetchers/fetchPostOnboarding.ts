import { getMarkdown } from "@/lib/utils/markdownReader";
import { PostOnboarding } from "@/lib/types/types";

export const fetchPostOnboarding = async (id: string): Promise<PostOnboarding> => {
  const fileContent = await import(`../../../../content/src/display-content/post-onboarding/${id}.md`);
  const markdown = getMarkdown(fileContent.default);
  const grayMatter = markdown.grayMatter as PostOnboardingGrayMatter;
  return {
    question: grayMatter.radioQuestion,
    contentMd: markdown.content,
    radioYes: grayMatter.radioYes,
    radioNo: grayMatter.radioNo,
    radioNoContent: grayMatter.radioNoContent,
  };
};

type PostOnboardingGrayMatter = {
  radioQuestion: string;
  radioYes: string;
  radioNo: string;
  radioNoContent: string;
};
