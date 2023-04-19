import { PostOnboarding } from "@/lib/types/types";
import { convertPostOnboardingMd } from "@/lib/utils/markdownReader";

export const fetchPostOnboarding = async (id: string): Promise<PostOnboarding> => {
  const fileContent = await import(`../../../../content/src/display-content/post-onboarding/${id}.md`);
  return convertPostOnboardingMd(fileContent.default, id);
};
