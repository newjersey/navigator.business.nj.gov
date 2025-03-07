import { generatev157BusinessUser, generatev157UserData } from "@db/migrations/v157_add_tax_clearance_data";
import { migrate_v157_to_v158, v158UserData } from "@db/migrations/v158_login_email_to_lowercase";

const createMigratedData = (testEmail: string): v158UserData => {
  const v157UserData = generatev157UserData({
    user: {
      ...generatev157BusinessUser({}),
      email: testEmail,
    },
    version: 157,
  });
  const migratedUserData = migrate_v157_to_v158(v157UserData);
  return migratedUserData;
};

describe("v158 migration converts the user email to lower case", () => {
  it.each([
    { scenario: "upper case email", email: "TEST_UPPER_CASE@TEST.COM" },
    { scenario: "mixed case email", email: "Test_Mixed_Case@Test.com" },
    { scenario: "already lower case email", email: "test_lower_case@test.com" },
  ])("should handle $scenario correctly", ({ email }) => {
    const migratedUserData = createMigratedData(email);
    expect(migratedUserData.version).toBe(158);
    expect(migratedUserData.user.email).toBeDefined();
    expect(migratedUserData.user.email).toBe(email.toLowerCase());
  });
});
