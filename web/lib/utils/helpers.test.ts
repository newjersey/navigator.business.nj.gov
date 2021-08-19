import { getUserNameOrEmailIfUserNameIsUndefinedFromUserData } from "./helpers";
import { generateUserData } from "@/test/factories";
import { generateUser } from "@/test/factories";
import { NavDefaults } from "@/display-content/NavDefaults";

describe("helpers", () => {
  it("returns the name of the user from userData argument", () => {
    const userData = generateUserData({ user: generateUser({ name: "John Smith" }) });
    expect(getUserNameOrEmailIfUserNameIsUndefinedFromUserData(userData)).toBe("John Smith");
  });
  it("returns the email of the user from userData argument when userData.user.name is undefined", () => {
    const userData = generateUserData({
      user: generateUser({ name: undefined, email: "Samantha.King@gmail.com" }),
    });
    expect(getUserNameOrEmailIfUserNameIsUndefinedFromUserData(userData)).toBe("Samantha.King@gmail.com");
  });
  it("returns the NavDefault.myNJAccountText when userData arugment is undefined", () => {
    const userData = undefined;
    expect(getUserNameOrEmailIfUserNameIsUndefinedFromUserData(userData)).toBe(NavDefaults.myNJAccountText);
  });
});
