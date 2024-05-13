export default {
  id: "callout",
  label: "Callout Block",
  fields: [
    {
      name: "calloutType",
      label: "Callout Type",
      widget: "select",
      default: "conditional",
      options: ["conditional", "informational", "warning", "note"],
    },
    {
      name: "showIcon",
      label: "Header Icon",
      widget: "boolean",
      default: false,
    },
    {
      name: "showHeader",
      label: "Show Header?",
      widget: "boolean",
      default: false,
    },
    {
      name: "headerText",
      label: "Header Text",
      default: "",
      widget: "string",
    },
    {
      name: "body",
      label: "Body Text",
      default: "",
      required: true,
      widget: "markdown",
    },
  ],

  pattern: /:::callout[^:]+:::/g,
  collapsed: false,
  summary: "{{fields.title}}",
  fromBlock: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    match: any
  ): { showHeader: boolean; headerText: string; body: string; calloutType: string; showIcon: boolean } => {
    const string = match[0];
    const closedCurlyIndex = string.indexOf("}");

    const showHeaderValue = string
      .slice(string.indexOf("showHeader="), string.indexOf("headerText="))
      .trim()
      .split("=")[1]
      .slice(1, -1)
      .trim();

    const headerValue = string
      .slice(string.indexOf("headerText="), string.indexOf("showIcon="))
      .trim()
      .split("=")[1]
      .slice(1, -1)
      .trim();

    const iconValue = string
      .slice(string.indexOf("showIcon="), string.indexOf("calloutType="))
      .trim()
      .split("=")[1]
      .slice(1, -1)
      .trim();

    const calloutTypeValue = string
      .slice(string.indexOf("calloutType="), closedCurlyIndex)
      .trim()
      .split("=")[1]
      .slice(1, -1)
      .trim();

    const endLength = ":::".length;

    const bodyValue = string.slice(closedCurlyIndex + 1, -1 * endLength).trim();

    return {
      calloutType: calloutTypeValue,
      showHeader: showHeaderValue,
      showIcon: iconValue,
      headerText: headerValue,
      body: bodyValue,
    };
  },

  // Function to create a text block from an instance of this component
  toBlock: (obj: {
    showHeader: boolean;
    headerText: string;
    body: string;
    calloutType: string;
    showIcon: boolean;
  }): string => {
    return `:::callout{ showHeader="${obj.showHeader}" headerText="${obj.headerText}" showIcon="${obj.showIcon}" calloutType="${obj.calloutType}" } \n ${obj.body}\n:::`;
  },
  toPreview: (obj: {
    showHeader: boolean;
    headerText: string;
    body: string;
    calloutType: string;
    showIcon: boolean;
  }): string => {
    return `:::callout{ showHeader="${obj.showHeader}" headerText="${obj.headerText}" showIcon="${obj.showIcon}" calloutType="${obj.calloutType}" } \n ${obj.body}\n:::`;
  },
};
