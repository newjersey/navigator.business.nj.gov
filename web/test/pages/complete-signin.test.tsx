import { render } from "@testing-library/react";
import * as sessionHelper from "@/lib/auth/sessionHelper";
import CompleteSignin from "@/pages/complete-signin";
import { useMockRouter } from "@/test/mock/mockRouter";

jest.mock("next/router");
jest.mock("@/lib/auth/sessionHelper", () => ({ triggerSignIn: jest.fn() }));
const mockSessionHelper = sessionHelper as jest.Mocked<typeof sessionHelper>;

describe("CompleteSignin Page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
  });

  it("triggers a signin on mount", () => {
    render(<CompleteSignin />);
    expect(mockSessionHelper.triggerSignIn).toHaveBeenCalled();
  });
});
