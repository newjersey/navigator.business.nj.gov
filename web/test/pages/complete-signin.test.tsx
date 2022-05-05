import * as sessionHelper from "@/lib/auth/sessionHelper";
import CompleteSignin from "@/pages/complete-signin";
import { useMockRouter } from "@/test/mock/mockRouter";
import { act, render } from "@testing-library/react";
import React from "react";

jest.mock("next/router");
jest.mock("@/lib/auth/sessionHelper", () => ({ triggerSignIn: jest.fn() }));
const mockSessionHelper = sessionHelper as jest.Mocked<typeof sessionHelper>;

describe("CompleteSignin Page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
  });

  it("triggers a signin on mount", async () => {
    act(async () => {
      render(<CompleteSignin />);
      expect(mockSessionHelper.triggerSignIn).toHaveBeenCalled();
    });
  });
});
