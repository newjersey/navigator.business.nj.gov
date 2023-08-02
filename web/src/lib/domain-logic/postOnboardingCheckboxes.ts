type PostOnboardingQuestionId = string;
type CheckboxId = string;

export const postOnboardingCheckboxes: Record<PostOnboardingQuestionId, CheckboxId[]> = {
  "construction-renovation": [
    "construction-renovation-site-drawings",
    "construction-renovation-utilities",
    "construction-renovation-permits",
    "construction-renovation-contractors",
  ],
};
