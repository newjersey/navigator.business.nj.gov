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
    render(<Callout calloutType={calloutType}>Some Body Text</Callout>);
    expect(screen.getByText(getHeaderText(calloutType))).toBeInTheDocument();
  });

  it(`does not render default header text for ${calloutType} callout`, () => {
    render(
      <Callout calloutType={calloutType} header="header text">
        Some Body Text
      </Callout>
    );
    expect(screen.queryByText(getHeaderText(calloutType))).not.toBeInTheDocument();
    expect(screen.getByText("header text")).toBeInTheDocument();
  });

  it(`renders header icon for ${calloutType} callout`, () => {
    render(
      <Callout calloutType={calloutType} icon>
        Some Body Text
      </Callout>
    );
    expect(screen.getByTestId(`${calloutComponentMapping[calloutType].iconStyling}`)).toBeInTheDocument();
  });

  it(`does not render header icon for ${calloutType} callout`, () => {
    render(
      <Callout calloutType={calloutType} icon={false}>
        Some Body Text
      </Callout>
    );
    expect(screen.queryByTestId("callout-icon")).not.toBeInTheDocument();
  });
});
