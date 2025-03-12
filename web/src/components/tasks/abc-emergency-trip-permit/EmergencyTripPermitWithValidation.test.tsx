import { EmergencyTripPermitWithValidation } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitWithValidation";
import { createTheme, ThemeProvider } from "@mui/material";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

describe("EmergencyPermitWithValidation", () => {
  describe("Validation", () => {
    const renderPage = (): void => {
      render(
        <ThemeProvider theme={createTheme()}>
          <EmergencyTripPermitWithValidation />
        </ThemeProvider>
      );
    };

    it("shows errors on required fields when submitted", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Review Step, State: Incomplete" })
      );
      await user.click(screen.getByRole("button", { name: "Submit & Pay" }));
      await user.click(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Requestor Step, State: Error" })
      );
      expect(screen.getByText("Enter a Requestor First Name.")).toBeInTheDocument();
    });

    it("does not show errors on non-required fields when submitted", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Review Step, State: Incomplete" })
      );
      await user.click(screen.getByRole("button", { name: "Submit & Pay" }));
      await user.click(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Requestor Step, State: Error" })
      );
      expect(screen.queryByText("Enter a Business Address Line 2.")).not.toBeInTheDocument();
    });

    it("validation persists when changing tabs", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Review Step, State: Incomplete" })
      );
      await user.click(screen.getByRole("button", { name: "Submit & Pay" }));
      await user.click(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Requestor Step, State: Error" })
      );
      expect(screen.getByText("Enter a Requestor First Name.")).toBeInTheDocument();
      await user.click(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Trip Step, State: Error" })
      );
      await user.click(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Requestor Step, State: Error" })
      );
      expect(screen.getByText("Enter a Requestor First Name.")).toBeInTheDocument();
    });

    it("triggers validation when clicking a required field and clicking away without entering data", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Requestor Step, State: Incomplete" })
      );
      await user.click(screen.getByRole("textbox", { name: "Requestor First Name" }));
      await user.click(screen.getByRole("textbox", { name: "Requestor Last Name" }));
      expect(screen.getByText("Enter a Requestor First Name.")).toBeInTheDocument();
    });

    it("triggers validation when entering too many characters for given field", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Requestor Step, State: Incomplete" })
      );
      await user.type(
        screen.getByRole("textbox", { name: "Requestor First Name" }),
        "hereIsAVeryLongInputIHaveEnteredIntoAFieldThatCannotHandleIt"
      );
      await user.click(screen.getByRole("textbox", { name: "Requestor Last Name" }));
      expect(screen.getByText("Requestor First Name must be 35 characters or fewer.")).toBeInTheDocument();
    });

    it("displays error alert on review page if not all fields are successfully validated", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Review Step, State: Incomplete" })
      );
      expect(screen.getByRole("alert", { name: "informational" })).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Submit & Pay" }));
      expect(screen.getByRole("alert", { name: "error" })).toBeInTheDocument();
      expect(
        screen.getByText("Check the steps below for missing information or errors:")
      ).toBeInTheDocument();
    });

    it("displays correct completion state for steps after submission attempt", async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole("button", { name: "Save & Continue" }));
      await user.type(screen.getByRole("textbox", { name: "Carrier Name (Business Name)" }), "carrier");
      await user.type(screen.getByRole("textbox", { name: "Requestor First Name" }), "firstName");
      await user.type(screen.getByRole("textbox", { name: "Requestor Last Name" }), "lastName");
      await user.type(screen.getByRole("textbox", { name: "Email Address" }), "email@email.com");
      await user.type(screen.getByRole("textbox", { name: "Phone Number" }), "1234567890");
      await user.type(screen.getByRole("textbox", { name: "Business Address Line 1" }), "add");
      await user.type(screen.getByRole("textbox", { name: "Business Address Line 2" }), "add2");
      await user.type(screen.getByRole("textbox", { name: "City" }), "city");
      await user.type(screen.getByRole("textbox", { name: "Zip Code" }), "zippy");
      await user.type(screen.getByRole("textbox", { name: "Vehicle Make" }), "make");
      await user.type(screen.getByRole("textbox", { name: "Vehicle Year" }), "1900");
      await user.type(screen.getByRole("textbox", { name: "VIN/Serial Number" }), "12345");
      await user.type(screen.getByRole("textbox", { name: "License Plate Number" }), "abc123");
      await user.click(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Review Step, State: Incomplete" })
      );
      await user.click(screen.getByRole("button", { name: "Submit & Pay" }));
      expect(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Instructions Step, State: Complete" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Requestor Step, State: Complete" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Trip Step, State: Error" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Billing Step, State: Complete" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Review Step, State: Error" })
      ).toBeInTheDocument();

      await user.click(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Requestor Step, State: Complete" })
      );
      await user.clear(screen.getByRole("textbox", { name: "Carrier Name (Business Name)" }));
      await user.click(screen.getByRole("textbox", { name: "Requestor First Name" }));
      expect(
        screen.getByRole("tab", { name: "Formation Stepper Navigation: Requestor Step, State: Error" })
      ).toBeInTheDocument();
    });
  });
});
