import { Callout, calloutComponentMapping, CalloutTypes } from "@/components/Callout";
import { getMergedConfig } from "@/contexts/configContext";
import { render, screen } from "@testing-library/react";

const calloutTypes: CalloutTypes[] = ["informational", "conditional", "warning", "note"];

const Config = getMergedConfig();

const getHeaderText = (calloutType: CalloutTypes): string => {
  if (calloutType === "informational") return Config.calloutDefaults.informationalHeadingDefaultText;
  if (calloutType === "note") return Config.calloutDefaults.noteHeadingDefaultText;
  if (calloutType === "conditional") return Config.calloutDefaults.conditionalHeadingDefaultText;
  if (calloutType === "warning") return Config.calloutDefaults.warningHeadingDefaultText;
  return "";
};

describe.each(calloutTypes)("<Callout />", (calloutType) => {
  it(`renders default header text for ${calloutType} callout`, () => {
    render(
      <Callout calloutType={calloutType} headerText="">
        Some Body Text
      </Callout>
    );
    expect(screen.getByText(getHeaderText(calloutType))).toBeInTheDocument();
  });

  it(`does not render header text for ${calloutType} callout when showHeader is false`, () => {
    render(
      <Callout calloutType={calloutType} showHeader={false} headerText="">
        Some Body Text
      </Callout>
    );
    expect(screen.queryByText(getHeaderText(calloutType))).not.toBeInTheDocument();
  });

  it(`does not render default header text for ${calloutType} callout`, () => {
    render(
      <Callout calloutType={calloutType} headerText="header text">
        Some Body Text
      </Callout>
    );
    expect(screen.queryByText(getHeaderText(calloutType))).not.toBeInTheDocument();
    expect(screen.getByText("header text")).toBeInTheDocument();
  });

  it(`renders header icon for ${calloutType} callout`, () => {
    render(
      <Callout calloutType={calloutType} showIcon={true}>
        Some Body Text
      </Callout>
    );
    expect(screen.getByTestId(`${calloutComponentMapping[calloutType].iconStyling}`)).toBeInTheDocument();
  });

  it(`does not render header icon for ${calloutType} callout`, () => {
    render(
      <Callout calloutType={calloutType} showIcon={false}>
        Some Body Text
      </Callout>
    );
    expect(screen.queryByTestId("callout-icon")).not.toBeInTheDocument();
  });
});
