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

  // eslint-disable-next-line unicorn/better-regex
  pattern: /:::callout[^:::]*?:::/gs,
  collapsed: false,
  summary: "{{fields.title}}",
  fromBlock: (
    match: RegExpMatchArray
  ): { showHeader: boolean; headerText: string; body: string; calloutType: string; showIcon: boolean } => {
    // We can safely assume there will be a single match; else we wouldn't be inside this function.
    const [calloutBlock] = match;

    // Everything inside the first {} we see we consider callout parameters; everything after is the body.
    // eslint-disable-next-line unicorn/better-regex
    const calloutParseMatcher = /{(?<parameters>[^}]+)}[^\n]*\n(?<body>[^:::{}]*)/gms;
    const calloutMatch = calloutParseMatcher.exec(calloutBlock);

    // If we just have :::callout {}\n:::, then we need to return some default values instead.
    const defaultCalloutContents =
      'showHeader="false" headerText="" showIcon="false" calloutType="conditional"';

    const calloutParameters = calloutMatch?.groups?.parameters ?? defaultCalloutContents;
    const calloutBody = calloutMatch?.groups?.body.trim() ?? "";

    const showHeaderMatch = calloutParameters.match(/showHeader="(?<showHeader>[^"]+)"/);
    const showHeaderValue = showHeaderMatch?.groups?.showHeader.trim() === "true";

    const headerTextMatch = calloutParameters.match(/headerText="(?<headerText>[^"]+)"/);
    const headerTextValue = headerTextMatch?.groups?.headerText.trim() ?? "";

    const showIconMatch = calloutParameters.match(/showIcon="(?<showIcon>[^"]+)"/);
    const showIconValue = showIconMatch?.groups?.showIcon.trim() === "true";

    const calloutTypeMatch = calloutParameters.match(/calloutType="(?<calloutType>[^"]+)"/);
    const calloutTypeValue = calloutTypeMatch?.groups?.calloutType.trim() ?? "conditional";

    return {
      calloutType: calloutTypeValue,
      showHeader: showHeaderValue,
      showIcon: showIconValue,
      headerText: headerTextValue,
      body: calloutBody,
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
    return `:::callout{ showHeader="${obj.showHeader}" headerText="${obj.headerText}" showIcon="${obj.showIcon}" calloutType="${obj.calloutType}" }\n\n${obj.body}\n\n:::`;
  },
  toPreview: (obj: {
    showHeader: boolean;
    headerText: string;
    body: string;
    calloutType: string;
    showIcon: boolean;
  }): string => {
    return `:::callout{ showHeader="${obj.showHeader}" headerText="${obj.headerText}" showIcon="${obj.showIcon}" calloutType="${obj.calloutType}" }\n${obj.body}\n:::`;
  },
};
