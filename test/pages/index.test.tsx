import Home from "../../pages";
import { renderWithUser } from "../helpers";
import { generateUser } from "../factories";

describe("HomePage", () => {
  describe("when not logged in", () => {
    it("displays welcome text", () => {
      const subject = renderWithUser(<Home />, undefined, jest.fn());

      expect(subject.queryByText("Welcome to EasyRegNJ")).toBeInTheDocument();
      expect(subject.queryByText("Log in")).toBeInTheDocument();
      expect(subject.queryByText("Log out")).not.toBeInTheDocument();
    });
  });

  describe("when logged in", () => {
    it("welcomes user by name", () => {
      const subject = renderWithUser(
        <Home />,
        generateUser({ name: "Ada Lovelace" }),
        jest.fn()
      );

      expect(subject.queryByText("Welcome, Ada Lovelace")).toBeInTheDocument();
      expect(subject.queryByText("Get Started")).toBeInTheDocument();
      expect(subject.queryByText("Log out")).toBeInTheDocument();
      expect(subject.queryByText("Log in")).not.toBeInTheDocument();
    });
  });
});
