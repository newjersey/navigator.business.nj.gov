import { EmergencyTripPermit } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermit";
import { createTheme, ThemeProvider } from "@mui/material";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

describe("EmergencyTripPermit", () => {
  const renderPage = (): void => {
    render(
      <ThemeProvider theme={createTheme()}>
        <EmergencyTripPermit />
      </ThemeProvider>
    );
  };

  describe("navigation", () => {
    it("advances steps from clicking the stepper", async () => {
      const user = userEvent.setup();
      renderPage();
      expect(screen.queryByTestId("carrier-field")).not.toBeInTheDocument();
      await user.click(screen.getByTestId("stepper-1"));
      expect(screen.getByTestId("carrier-field")).toBeInTheDocument();
    });

    it("advances steps from clicking the primary button", async () => {
      const user = userEvent.setup();
      renderPage();
      expect(screen.queryByTestId("carrier-field")).not.toBeInTheDocument();
      await user.click(screen.getByTestId("next-button"));
      expect(screen.getByTestId("carrier-field")).toBeInTheDocument();
    });

    it("only displays back button on steps past the first step", async () => {
      const user = userEvent.setup();
      renderPage();
      expect(screen.queryByTestId("back-button")).not.toBeInTheDocument();
      await user.click(screen.getByTestId("next-button"));
      expect(screen.getByTestId("back-button")).toBeInTheDocument();
    });

    it("back button goes back a step", async () => {
      const user = userEvent.setup();
      renderPage();
      expect(screen.queryByTestId("back-button")).not.toBeInTheDocument();
      await user.click(screen.getByTestId("next-button"));
      expect(screen.getByTestId("back-button")).toBeInTheDocument();
      await user.click(screen.getByTestId("back-button"));
      expect(screen.queryByTestId("back-button")).not.toBeInTheDocument();
    });

    it("returns to earlier section when edit button is clicked on review step", async () => {
      const user = userEvent.setup();
      renderPage();
      expect(screen.queryByTestId("back-button")).not.toBeInTheDocument();
      await user.click(screen.getByTestId("stepper-4"));
      await user.click(screen.getByTestId("requestor-review-section"));
      expect(screen.getByTestId("carrier-field")).toBeInTheDocument();
    });
  });

  describe("Conditional rendering", () => {
    it("displays review page info for entered fields", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByTestId("next-button"));
      await user.type(screen.getByTestId("vehicleMake-input"), "CarMake");
      await user.click(screen.getByTestId("stepper-4"));
      expect(screen.getByText("CarMake")).toBeInTheDocument();
    });

    it("prepopulates billing information from requestor information", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByTestId("next-button"));
      await user.type(screen.getByTestId("requestorFirstName-input"), "firstName");
      await user.type(screen.getByTestId("requestorLastName-input"), "lastName");
      await user.type(screen.getByTestId("requestorEmail-input"), "email@email.com");
      await user.type(screen.getByTestId("requestorPhone-input"), "1234567890");
      await user.type(screen.getByTestId("requestorAddress1-input"), "add");
      await user.type(screen.getByTestId("requestorAddress2-input"), "add2");
      await user.type(screen.getByTestId("requestorCity-input"), "city");
      await user.type(screen.getByTestId("requestorZipPostalCode-input"), "zippy");
      await user.click(screen.getByTestId("stepper-3"));
      expect(screen.getByDisplayValue("firstName")).toBeInTheDocument();
      expect(screen.getByDisplayValue("lastName")).toBeInTheDocument();
      expect(screen.getByDisplayValue("email@email.com")).toBeInTheDocument();
      expect(screen.getByDisplayValue("1234567890")).toBeInTheDocument();
      expect(screen.getByDisplayValue("add")).toBeInTheDocument();
      expect(screen.getByDisplayValue("add2")).toBeInTheDocument();
      expect(screen.getByDisplayValue("city")).toBeInTheDocument();
      expect(screen.getByDisplayValue("zippy")).toBeInTheDocument();
    });

    it("can overwrite prepopulated values on the billing page without affecting the requestor page", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByTestId("next-button"));
      await user.type(screen.getByTestId("requestorFirstName-input"), "firstName");
      await user.type(screen.getByTestId("requestorLastName-input"), "lastName");
      await user.type(screen.getByTestId("requestorEmail-input"), "email@email.com");
      await user.type(screen.getByTestId("requestorPhone-input"), "1234567890");
      await user.type(screen.getByTestId("requestorAddress1-input"), "add");
      await user.type(screen.getByTestId("requestorAddress2-input"), "add2");
      await user.type(screen.getByTestId("requestorCity-input"), "city");
      await user.type(screen.getByTestId("requestorZipPostalCode-input"), "zippy");
      await user.click(screen.getByTestId("stepper-3"));
      expect(screen.getByDisplayValue("firstName")).toBeInTheDocument();
      expect(screen.getByDisplayValue("lastName")).toBeInTheDocument();
      expect(screen.getByDisplayValue("email@email.com")).toBeInTheDocument();
      expect(screen.getByDisplayValue("1234567890")).toBeInTheDocument();
      expect(screen.getByDisplayValue("add")).toBeInTheDocument();
      expect(screen.getByDisplayValue("add2")).toBeInTheDocument();
      expect(screen.getByDisplayValue("city")).toBeInTheDocument();
      expect(screen.getByDisplayValue("zippy")).toBeInTheDocument();

      await user.type(screen.getByTestId("payerFirstName-input"), "newFirstName");
      await user.click(screen.getByTestId("stepper-2"));
      expect(screen.queryByDisplayValue("newFirstName")).not.toBeInTheDocument();
    });

    it("displays additional fields on review page if checkboxes are clicked on billing page", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByTestId("stepper-3"));
      expect(screen.queryByTestId("textMsgMobile-input")).not.toBeInTheDocument();
      expect(screen.queryByTestId("additionalEmail-input")).not.toBeInTheDocument();
      await user.click(screen.getByLabelText("Send the permit download link via text message"));
      await user.click(screen.getByLabelText("Send the permit download link to another email address"));

      expect(screen.getByTestId("textMsgMobile-input")).toBeInTheDocument();
      expect(screen.getByTestId("additionalEmail-input")).toBeInTheDocument();
      await user.type(screen.getByTestId("textMsgMobile-input"), "1234567890");
      await user.type(screen.getByTestId("additionalEmail-input"), "test@test.com");
      await user.click(screen.getByTestId("stepper-4"));

      expect(screen.getByText("1234567890")).toBeInTheDocument();
      expect(screen.getByText("test@test.com")).toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("displays validation if a required field is clicked and then clicked away without input", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByTestId("stepper-1"));
      await user.click(screen.getByTestId("requestorFirstName-input"));
      await user.click(screen.getByTestId("requestorLastName-input"));

      expect(screen.getByText("Enter a Requestor First Name.")).toBeInTheDocument();
    });

    it("displays validation if a field with maximum length exceeds its length", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByTestId("stepper-1"));
      await user.type(
        screen.getByTestId("requestorFirstName-input"),
        "Here, you see? An input with far too many characters. A truly dazzling feat, a gluttonous overflow of characters, even"
      );
      await user.click(screen.getByTestId("requestorLastName-input"));

      expect(screen.getByText("Requestor First Name must be 35 characters or fewer.")).toBeInTheDocument();
    });

    it("maintains validation if user goes to a different tab and back", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByTestId("stepper-1"));
      await user.type(
        screen.getByTestId("requestorFirstName-input"),
        "Here, you see? An input with far too many characters. A truly dazzling feat, a gluttonous overflow of characters, even"
      );
      await user.click(screen.getByTestId("requestorLastName-input"));

      expect(screen.getByText("Requestor First Name must be 35 characters or fewer.")).toBeInTheDocument();

      await user.click(screen.getByTestId("stepper-4"));
      await user.click(screen.getByTestId("stepper-1"));
      expect(screen.getByText("Requestor First Name must be 35 characters or fewer.")).toBeInTheDocument();
    });
  });
});
