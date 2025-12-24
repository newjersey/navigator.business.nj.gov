import { LoadingPageComponent } from "@/components/LoadingPageComponent";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { withAuth } from "@/test/helpers/helpers-renderers";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { render, screen } from "@testing-library/react";

const Config = getMergedConfig();

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));

describe("LoadingPageComponent", () => {
  describe("when there are no errors", () => {
    it("shows only the loading indicator", () => {
      render(
        withAuth(<LoadingPageComponent hasError={false} />, {
          isAuthenticated: IsAuthenticated.TRUE,
        }),
      );

      expect(screen.queryByText(Config.loginSupportPage.havingTrouble)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.loginSupportPage.unlinkedAccount)).not.toBeInTheDocument();
    });
  });

  describe("when there are errors", () => {
    describe("user is logged in and has a myNJ linking error", () => {
      it("shows unlinked account message, logout instructions, and help link", () => {
        render(
          withAuth(<LoadingPageComponent hasError={true} isLinkingError={true} />, {
            isAuthenticated: IsAuthenticated.TRUE,
          }),
        );

        expect(screen.getByText(Config.loginSupportPage.unlinkedAccount)).toBeInTheDocument();

        expect(
          screen.getByRole("button", { name: Config.loginSupportPage.logoutButtonTextUnlinked }),
        ).toBeInTheDocument();
        expect(screen.getByText(/please/i)).toBeInTheDocument();
        expect(screen.getByText(/and try again/i)).toBeInTheDocument();

        expect(screen.getByRole("link", { name: /login issues help page/i })).toBeInTheDocument();
      });

      it("'unlinked account' message is not bold", () => {
        render(
          withAuth(<LoadingPageComponent hasError={true} isLinkingError={true} />, {
            isAuthenticated: IsAuthenticated.TRUE,
          }),
        );

        const UnlinkedAccountMessage = screen.getByText(Config.loginSupportPage.unlinkedAccount);
        expect(UnlinkedAccountMessage).not.toHaveClass("text-bold");
      });
    });

    describe("user is logged in and has no myNJ linking error", () => {
      it("shows bolded 'having trouble' message, logout instructions, and help link", () => {
        render(
          withAuth(<LoadingPageComponent hasError={true} isLinkingError={false} />, {
            isAuthenticated: IsAuthenticated.TRUE,
          }),
        );

        const havingTroubleMessage = screen.getByText(Config.loginSupportPage.havingTrouble);
        expect(havingTroubleMessage).toBeInTheDocument();
        expect(havingTroubleMessage).toHaveClass("text-bold");

        expect(
          screen.getByRole("button", { name: Config.loginSupportPage.logoutButtonText }),
        ).toBeInTheDocument();
        expect(screen.getByText(/and try again/i)).toBeInTheDocument();

        expect(screen.getByRole("link", { name: /login issues help page/i })).toBeInTheDocument();
      });

      it("does not show the 'Please' text from the unlinked 'log out' message'", () => {
        render(
          withAuth(<LoadingPageComponent hasError={true} isLinkingError={false} />, {
            isAuthenticated: IsAuthenticated.TRUE,
          }),
        );

        expect(screen.queryByText(/please/i)).not.toBeInTheDocument();
      });
    });

    describe("user is logged out and has a myNJ linking error", () => {
      it("shows unlinked account message and help link, but no logout link", () => {
        render(
          withAuth(<LoadingPageComponent hasError={true} isLinkingError={true} />, {
            isAuthenticated: IsAuthenticated.FALSE,
          }),
        );

        expect(screen.getByText(Config.loginSupportPage.unlinkedAccount)).toBeInTheDocument();

        expect(
          screen.queryByRole("button", { name: Config.loginSupportPage.logoutButtonText }),
        ).not.toBeInTheDocument();
        // "please" is only in the "logged in and unlinked" error copy
        expect(screen.queryByText(/please/i)).not.toBeInTheDocument();

        expect(screen.getByRole("link", { name: /login issues help page/i })).toBeInTheDocument();
      });
    });

    describe("user is logged out and has no myNJ linking error", () => {
      it("shows bolded 'having trouble' message and help link, but no logout link", () => {
        render(
          withAuth(<LoadingPageComponent hasError={true} isLinkingError={false} />, {
            isAuthenticated: IsAuthenticated.FALSE,
          }),
        );

        const havingTroubleMessage = screen.getByText(Config.loginSupportPage.havingTrouble);
        expect(havingTroubleMessage).toBeInTheDocument();
        expect(havingTroubleMessage).toHaveClass("text-bold");

        expect(
          screen.queryByRole("button", { name: Config.loginSupportPage.logoutButtonText }),
        ).not.toBeInTheDocument();

        expect(screen.getByRole("link", { name: /login issues help page/i })).toBeInTheDocument();
      });
    });
  });
});
