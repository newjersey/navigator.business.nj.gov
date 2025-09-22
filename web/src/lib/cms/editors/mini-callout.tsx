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
      name: "body",
      label: "Body Text",
      default: "",
      required: true,
      widget: "markdown",
    },
  ],

  // eslint-disable-next-line unicorn/better-regex
  pattern: /:::miniCallout[^:::]*?:::/gs,
  collapsed: false,
  summary: "{{fields.title}}",
  fromBlock: (
    match: RegExpMatchArray,
  ): {
    body: string;
    calloutType: string;
  } => {
    // We can safely assume there will be a single match; else we wouldn't be inside this function.
    const [calloutBlock] = match;

    // Everything inside the first {} we see we consider callout parameters; everything after is the body.
    // eslint-disable-next-line unicorn/better-regex
    const calloutParseMatcher = /{(?<parameters>[^}]+)}[^\n]*\n(?<body>[^:::{}]*)/gms;
    const calloutMatch = calloutParseMatcher.exec(calloutBlock);

    // If we just have :::miniCallout {}\n:::, then we need to return some default values instead.
    const defaultCalloutContents = 'calloutType="conditional"';

    const calloutParameters = calloutMatch?.groups?.parameters ?? defaultCalloutContents;

    const calloutBody = calloutMatch?.groups?.body.trim() ?? "";

    const calloutTypeMatch = calloutParameters.match(/calloutType="(?<calloutType>[^"]+)"/);
    const calloutTypeValue = calloutTypeMatch?.groups?.calloutType.trim() ?? "conditional";

    return {
      calloutType: calloutTypeValue,
      body: calloutBody,
    };
  },
  toBlock: (obj: { calloutType: string; body: string }): string => {
    return `:::miniCallout{ calloutType="${obj.calloutType}" }\n${obj.body}\n:::`;
  },
  toPreview: (obj: { calloutType: string; body: string }): string => {
    return `:::miniCallout{ calloutType="${obj.calloutType}" }\n${obj.body}\n:::`;
  },
};
