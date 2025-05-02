import { EmergencyTripPermit } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermit";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { createTheme, ThemeProvider } from "@mui/material";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

describe("EmergencyTripPermit", () => {
  const renderPage = (): void => {
    render(
      <ThemeProvider theme={createTheme()}>
        <DataFormErrorMapContext.Provider
          value={{
            fieldStates: createDataFormErrorMap(),
            runValidations: false,
            reducer: () => {},
          }}
        >
          <EmergencyTripPermit />
        </DataFormErrorMapContext.Provider>
      </ThemeProvider>,
    );
  };

  describe("navigation", () => {
    it("advances steps from clicking the stepper", async () => {
      const user = userEvent.setup();
      renderPage();
      expect(
        screen.queryByRole("textbox", { name: "Carrier Name (Business Name)" }),
      ).not.toBeInTheDocument();
      await user.click(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Requestor Step, State: Incomplete",
        }),
      );
      expect(
        screen.getByRole("textbox", { name: "Carrier Name (Business Name)" }),
      ).toBeInTheDocument();
    });

    it("advances steps from clicking the primary button", async () => {
      const user = userEvent.setup();
      renderPage();
      expect(
        screen.queryByRole("textbox", { name: "Carrier Name (Business Name)" }),
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Save & Continue" }));
      expect(
        screen.getByRole("textbox", { name: "Carrier Name (Business Name)" }),
      ).toBeInTheDocument();
    });

    it("only displays back button on steps past the first step", async () => {
      const user = userEvent.setup();
      renderPage();
      expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Save & Continue" }));
      expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    });

    it("back button goes back a step", async () => {
      const user = userEvent.setup();
      renderPage();
      expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Save & Continue" }));
      expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Back" }));
      expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
    });

    it("returns to earlier section when edit button is clicked on review step", async () => {
      const user = userEvent.setup();
      renderPage();
      expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
      await user.click(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Review Step, State: Incomplete",
        }),
      );
      await user.click(screen.getByRole("button", { name: "Edit Requestor Information" }));
      expect(
        screen.getByRole("textbox", { name: "Carrier Name (Business Name)" }),
      ).toBeInTheDocument();
    });
  });

  describe("Conditional rendering", () => {
    it("displays review page info for entered fields", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByRole("button", { name: "Save & Continue" }));
      await user.type(screen.getByRole("textbox", { name: "Vehicle Make" }), "CarMake");
      await user.click(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Review Step, State: Incomplete",
        }),
      );
      expect(screen.getByText("CarMake")).toBeInTheDocument();
    });

    it("prepopulates billing information from requestor information", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByRole("button", { name: "Save & Continue" }));
      await user.type(screen.getByRole("textbox", { name: "Requestor First Name" }), "firstName");
      await user.type(screen.getByRole("textbox", { name: "Requestor Last Name" }), "lastName");
      await user.type(screen.getByRole("textbox", { name: "Email Address" }), "email@email.com");
      await user.type(screen.getByRole("textbox", { name: "Phone Number" }), "1234567890");
      await user.type(screen.getByRole("textbox", { name: "Business Address Line 1" }), "add");
      await user.type(screen.getByRole("textbox", { name: "Business Address Line 2" }), "add2");
      await user.type(screen.getByRole("textbox", { name: "City" }), "city");
      await user.type(screen.getByRole("textbox", { name: "Zip Code" }), "zippy");
      // Go to Billing Step
      await user.click(screen.getByRole("button", { name: "Save & Continue" }));
      await user.click(screen.getByRole("button", { name: "Save & Continue" }));

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
      await user.click(screen.getByRole("button", { name: "Save & Continue" }));
      await user.type(screen.getByRole("textbox", { name: "Requestor First Name" }), "firstName");
      await user.type(screen.getByRole("textbox", { name: "Requestor Last Name" }), "lastName");
      await user.type(screen.getByRole("textbox", { name: "Email Address" }), "email@email.com");
      await user.type(screen.getByRole("textbox", { name: "Phone Number" }), "1234567890");
      await user.type(screen.getByRole("textbox", { name: "Business Address Line 1" }), "add");
      await user.type(screen.getByRole("textbox", { name: "Business Address Line 2" }), "add2");
      await user.type(screen.getByRole("textbox", { name: "City" }), "city");
      await user.type(screen.getByRole("textbox", { name: "Zip Code" }), "zippy");

      // Go to Billing Step
      await user.click(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Billing Step, State: Incomplete",
        }),
      );

      expect(screen.getByDisplayValue("firstName")).toBeInTheDocument();
      expect(screen.getByDisplayValue("lastName")).toBeInTheDocument();
      expect(screen.getByDisplayValue("email@email.com")).toBeInTheDocument();
      expect(screen.getByDisplayValue("1234567890")).toBeInTheDocument();
      expect(screen.getByDisplayValue("add")).toBeInTheDocument();
      expect(screen.getByDisplayValue("add2")).toBeInTheDocument();
      expect(screen.getByDisplayValue("city")).toBeInTheDocument();
      expect(screen.getByDisplayValue("zippy")).toBeInTheDocument();

      await user.type(screen.getByRole("textbox", { name: "First Name" }), "newFirstName");
      await user.click(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Requestor Step, State: Incomplete",
        }),
      );
      expect(screen.queryByDisplayValue("newFirstName")).not.toBeInTheDocument();
    });

    it("displays additional fields on review page if checkboxes are clicked on billing page", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(
        screen.getByRole("tab", {
          name: "Formation Stepper Navigation: Billing Step, State: Incomplete",
        }),
      );
      expect(screen.queryAllByRole("textbox", { name: "Phone Number" })).toHaveLength(1);
      expect(screen.queryAllByRole("textbox", { name: "Email Address" })).toHaveLength(1);
      await user.click(
        screen.getByRole("checkbox", { name: "Send the permit download link via text message" }),
      );
      await user.click(
        screen.getByRole("checkbox", {
          name: "Send the permit download link to another email address",
        }),
      );

      expect(screen.queryAllByRole("textbox", { name: "Phone Number" })).toHaveLength(2);
      expect(screen.queryAllByRole("textbox", { name: "Email Address" })).toHaveLength(2);
      await user.type(screen.getAllByRole("textbox", { name: "Phone Number" })[1], "1234567890");
      await user.type(
        screen.getAllByRole("textbox", { name: "Email Address" })[1],
        "test@test.com",
      );
      await user.click(screen.getByRole("button", { name: "Save & Continue" }));

      expect(screen.getByText("1234567890")).toBeInTheDocument();
      expect(screen.getByText("test@test.com")).toBeInTheDocument();
    });
  });
});
