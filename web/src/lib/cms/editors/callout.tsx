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
      name: "icon",
      label: "Header Icon",
      widget: "boolean",
      default: false,
    },
    {
      name: "header",
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromBlock: (match: any): { header: string; body: string; calloutType: string; icon: boolean } => {
    const string = match[0];
    const closedCurlyIndex = string.indexOf("}");

    const headerValue = string
      .slice(string.indexOf("header="), string.indexOf("icon="))
      .trim()
      .split("=")[1]
      .slice(1, -1)
      .trim();

    const iconValue = string
      .slice(string.indexOf("icon="), string.indexOf("calloutType="))
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
      icon: iconValue,
      header: headerValue,
      body: bodyValue,
    };
  },

  // Function to create a text block from an instance of this component
  toBlock: (obj: { header: string; body: string; calloutType: string; icon: boolean }): string => {
    return `:::callout{ header="${obj.header}" icon="${obj.icon}" calloutType="${obj.calloutType}" } \n ${obj.body}\n:::`;
  },
  toPreview: (obj: { header: string; body: string; calloutType: string; icon: boolean }): string => {
    return `:::callout{ header="${obj.header}" icon="${obj.icon}" calloutType="${obj.calloutType}" } \n ${obj.body}\n:::`;
  },
};
