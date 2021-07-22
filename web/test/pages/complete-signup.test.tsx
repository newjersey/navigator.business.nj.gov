import { render } from "@testing-library/react";
import * as sessionHelper from "@/lib/auth/sessionHelper";
import CompleteSignup from "@/pages/complete-signup";

jest.mock("next/router");
jest.mock("@/lib/auth/sessionHelper", () => ({ triggerSignIn: jest.fn() }));
const mockSessionHelper = sessionHelper as jest.Mocked<typeof sessionHelper>;

describe("CompleteSignup Page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("triggers a signin on mount", () => {
    render(<CompleteSignup />);
    expect(mockSessionHelper.triggerSignIn).toHaveBeenCalled();
  });
});
