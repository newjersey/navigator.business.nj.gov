import {generatev181EnvironmentQuestionnaireData} from "@db/migrations/v181_add_updates_reminders_and_phone_number";
import {v181EnvironmentQuestionnaireDataSchema} from "@db/zodSchema/zodSchemas";


describe("userSchema validation", () => {
  it("should fail for invalid data", () => {
    const validData = generatev181EnvironmentQuestionnaireData({});

    const result = v181EnvironmentQuestionnaireDataSchema.safeParse(validData);

    // Expect validation to fail
    expect(result.success).toBe(false);

  });
});
