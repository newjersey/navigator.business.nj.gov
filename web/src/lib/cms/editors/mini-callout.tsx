export default {
  id: "miniCallout",
  label: "Mini Callout Block",
  fields: [
    {
      name: "calloutType",
      label: "Callout Type",
      widget: "select",
      default: "conditional",
      options: ["conditional", "informational", "warning", "quickReference"],
    },
    {
      name: "headerText",
      label: "Header Text",
      default: "",
      widget: "markdown",
      hint: "text is bolded for all callout types except for warning callout type which can include unbolded text and links",
    },
  ],

  // eslint-disable-next-line unicorn/better-regex
  pattern: /:::miniCallout[^:::]*?:::/gs,
  collapsed: false,
  summary: "{{fields.title}}",
  fromBlock: (
    match: RegExpMatchArray,
  ): {
    headerText: string;
    calloutType: string;
  } => {
    // We can safely assume there will be a single match; else we wouldn't be inside this function.
    const [calloutBlock] = match;

    // Everything inside the first {} we see we consider callout parameters; everything after is the body.
    // eslint-disable-next-line unicorn/better-regex
    const calloutParseMatcher = /{(?<parameters>[^}]+)}[^\n]*\n(?<body>[^:::{}]*)/gms;
    const calloutMatch = calloutParseMatcher.exec(calloutBlock);

    // If we just have :::miniCallout {}\n:::, then we need to return some default values instead.
    const defaultCalloutContents = 'headerText="" calloutType="conditional"';

    const calloutParameters = calloutMatch?.groups?.parameters ?? defaultCalloutContents;

    const headerTextMatch = calloutParameters.match(/headerText="(?<headerText>[^"]+)"/);
    const headerTextValue = headerTextMatch?.groups?.headerText.trim() ?? "";

    const calloutTypeMatch = calloutParameters.match(/calloutType="(?<calloutType>[^"]+)"/);
    const calloutTypeValue = calloutTypeMatch?.groups?.calloutType.trim() ?? "conditional";

    return {
      calloutType: calloutTypeValue,
      headerText: headerTextValue,
    };
  },

  // Function to create a text block from an instance of this component
  toBlock: (obj: { headerText: string; calloutType: string }): string => {
    return `:::miniCallout{ headerText="${obj.headerText}" calloutType="${obj.calloutType}"  }\n\n:::`;
  },
  toPreview: (obj: { headerText: string; calloutType: string }): string => {
    return `:::miniCallout{ headerText="${obj.headerText}" calloutType="${obj.calloutType}"  }\n\n:::`;
  },
};
