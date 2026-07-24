import { renderWithUserData } from "@/test/render/renderWithUserData";
import { EmergencyTripPermitWithValidation } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitWithValidation";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

describe("EmergencyPermitWithValidation", () => {
  describe("Validation", () => {
    const renderPage = (): void => {
      renderWithUserData(
        <ThemeProvider theme={createTheme()}>
          <EmergencyTripPermitWithValidation />
        </ThemeProvider>,
      );
    };

    it("shows errors on required fields when submitted", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Review Step, State: Incomplete",
        }),
      );
      await user.click(screen.getByRole("button", { name: "Pay Now" }));
      await user.click(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Requestor Step, State: Error",
        }),
      );
      expect(screen.getByText("Enter a First Name.")).toBeInTheDocument();
    });

    it("does not show errors on non-required fields when submitted", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Review Step, State: Incomplete",
        }),
      );
      await user.click(screen.getByRole("button", { name: "Pay Now" }));
      await user.click(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Requestor Step, State: Error",
        }),
      );
      expect(screen.queryByText("Enter a Address Line 2.")).not.toBeInTheDocument();
    });

    it("validation persists when changing tabs", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Review Step, State: Incomplete",
        }),
      );
      await user.click(screen.getByRole("button", { name: "Pay Now" }));
      await user.click(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Requestor Step, State: Error",
        }),
      );
      expect(screen.getByText("Enter a First Name.")).toBeInTheDocument();
      await user.click(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Trip Step, State: Error" }),
      );
      await user.click(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Requestor Step, State: Error",
        }),
      );
      expect(screen.getByText("Enter a First Name.")).toBeInTheDocument();
    });

    it("triggers validation when clicking a required field and clicking away without entering data", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Requestor Step, State: Incomplete",
        }),
      );
      await user.click(screen.getByRole("textbox", { name: "First Name" }));
      await user.click(screen.getByRole("textbox", { name: "Last Name" }));
      expect(screen.getByText("Enter a First Name.")).toBeInTheDocument();
    });

    it("triggers validation when entering too many characters for given field", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Requestor Step, State: Incomplete",
        }),
      );
      await user.type(
        screen.getByRole("textbox", { name: "First Name" }),
        "hereIsAVeryLongInputIHaveEnteredIntoAFieldThatCannotHandleIt",
      );
      await user.click(screen.getByRole("textbox", { name: "Last Name" }));
      expect(screen.getByText("First Name must be 35 characters or fewer.")).toBeInTheDocument();
    });

    it("displays error alert on review page if not all fields are successfully validated", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Review Step, State: Incomplete",
        }),
      );
      expect(screen.getByRole("alert", { name: "informational" })).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Pay Now" }));
      expect(screen.getByRole("alert", { name: "error" })).toBeInTheDocument();
      expect(
        screen.getByText("Check the steps below for missing information or errors:"),
      ).toBeInTheDocument();
    });

    it("displays correct completion state for steps after submission attempt", async () => {
      const user = userEvent.setup();
      renderPage();
      const fillTextField = (name: string, value: string): void => {
        fireEvent.change(screen.getByRole("textbox", { name }), { target: { value } });
      };

      await user.click(screen.getByRole("button", { name: "Save & Continue" }));
      fillTextField("Carrier Name", "carrier");
      fillTextField("First Name", "firstName");
      fillTextField("Last Name", "lastName");
      fillTextField("Email Address", "email@email.com");
      fillTextField("Phone Number", "1234567890");
      fillTextField("Address Line 1", "add");
      fillTextField("Address Line 2", "add2");
      fillTextField("City", "city");
      fillTextField("Zip Code", "12345");
      fillTextField("Vehicle Make", "make");
      fillTextField("Vehicle Year", "1900");
      fillTextField("VIN/Serial Number", "12345678901234567");
      fillTextField("License Plate Number", "abc123");
      await user.click(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Review Step, State: Incomplete",
        }),
      );
      await user.click(screen.getByRole("button", { name: "Pay Now" }));
      expect(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Instructions Step, State: Complete",
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Requestor Step, State: Complete",
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Trip Step, State: Error" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Billing Step, State: Complete",
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Review Step, State: Error",
        }),
      ).toBeInTheDocument();

      await user.click(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Requestor Step, State: Complete",
        }),
      );
      await user.clear(screen.getByRole("textbox", { name: "Carrier Name" }));
      await user.click(screen.getByRole("textbox", { name: "First Name" }));
      expect(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Requestor Step, State: Error",
        }),
      ).toBeInTheDocument();
    });
  });
});
