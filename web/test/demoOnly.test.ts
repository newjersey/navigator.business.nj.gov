import { loadAnytimeActionTasksByFileName } from "@businessnjgovnavigator/shared/static";
import { nonEssentialQuestionsArray } from "../../content/src/roadmaps/nonEssentialQuestions.json";
import { LookupIndustryById } from "../../shared/lib/shared/src";

/*
 * Special test cases to ensure that demo-only content is not used in production
 */
describe("demo-only", () => {
  describe("industry", () => {
    it("demo-only industry should always be disabled", () => {
      expect(LookupIndustryById("demo-only").isEnabled).toBe(false);
    });
  });

  describe("Non-Essential Question", () => {
    it("should be the only non-essential question to contain the demo-only Anytime Action", () => {
      const nonDemoOnlyQuestions = nonEssentialQuestionsArray.filter(
        (question) => question.id !== "demo-only",
      );
      for (const question of nonDemoOnlyQuestions) {
        expect(question?.anytimeActions ?? []).not.toContain("demo-only");
      }

      const demoOnlyQuestion = nonEssentialQuestionsArray.find(
        (question) => question.id === "demo-only",
      );
      expect(demoOnlyQuestion?.anytimeActions).toContain("demo-only");
    });
  });

  describe("Anytime Action", () => {
    it("should not appear for any industry or sector", () => {
      const demoAnytimeAction = loadAnytimeActionTasksByFileName("demo-only.md", true);

      expect(demoAnytimeAction.industryIds.length).toBe(0);
      expect(demoAnytimeAction.sectorIds.length).toBe(0);
    });
  });
});
