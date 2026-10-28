import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { render, screen } from "@testing-library/react";
import { FormBusiness } from "@/components/learn/FormBusiness";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness } from "@/test/mock/mockUseUserData";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/auth/signinHelper", () => ({ onSelfRegister: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("FormBusiness", () => {
  it("shows an icon for each more-info callout", () => {
    useMockRouter({});
    useMockBusiness({});

    const Config = getMergedConfig();
    render(<FormBusiness heading={Config.learnPages.steps[1].name} />);

    const icons = screen.getAllByTestId("form-business-callout-icon");
    expect(icons).toHaveLength(3);
    expect(icons[0]).toHaveClass("learn-form-business-callout-icon--conditional");
    expect(icons[1]).toHaveClass("learn-form-business-callout-icon--informational");
    expect(icons[2]).toHaveClass("learn-form-business-callout-icon--quickReference");
  });
});
