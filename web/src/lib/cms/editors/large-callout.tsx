export default {
  id: "largeCallout",
  label: "Large Callout Block",
  fields: [
    {
      name: "calloutType",
      label: "Callout Type",
      widget: "select",
      default: "conditional",
      options: ["conditional", "informational", "warning", "quickReference"],
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
    {
      name: "amountIconText",
      label: "Amount Icon Text",
      default: "",
      widget: "string",
    },
    {
      name: "filingTypeIconText",
      label: "Filing Type Icon Text",
      default: "",
      widget: "string",
    },
    {
      name: "frequencyIconText",
      label: "Frequency Icon Text",
      default: "",
      widget: "string",
    },
    {
      name: "phoneIconText",
      label: "Phone Icon Text",
      default: "",
      widget: "string",
    },
    {
      name: "phoneIconLabel",
      label: "Phone Icon Label",
      default: "",
      widget: "string",
    },
    {
      name: "emailIconText",
      label: "Email Icon Text",
      default: "",
      widget: "string",
    },
  ],

  // eslint-disable-next-line unicorn/better-regex
  pattern: /:::largeCallout[^:::]*?:::/gs,
  collapsed: false,
  summary: "{{fields.title}}",
  fromBlock: (
    match: RegExpMatchArray,
  ): {
    showHeader: boolean;
    headerText: string;
    body: string;
    calloutType: string;
    amountIconText: string;
    filingTypeIconText: string;
    frequencyIconText: string;
    phoneIconText: string;
    phoneIconLabel: string;
    emailIconText: string;
  } => {
    // We can safely assume there will be a single match; else we wouldn't be inside this function.
    const [calloutBlock] = match;

    // Everything inside the first {} we see we consider callout parameters; everything after is the body.
    // eslint-disable-next-line unicorn/better-regex
    const calloutParseMatcher = /{(?<parameters>[^}]+)}[^\n]*\n(?<body>[^:::{}]*)/gms;
    const calloutMatch = calloutParseMatcher.exec(calloutBlock);

    // If we just have :::largeCallout {}\n:::, then we need to return some default values instead.
    const defaultCalloutContents =
      'showHeader="false" headerText="" calloutType="conditional" amountIconText="" filingTypeIconText="" frequencyIconText="" phoneIconText="" phoneIconLabel="" emailIconText=""';

    const calloutParameters = calloutMatch?.groups?.parameters ?? defaultCalloutContents;
    const calloutBody = calloutMatch?.groups?.body.trim() ?? "";

    const showHeaderMatch = calloutParameters.match(/showHeader="(?<showHeader>[^"]+)"/);
    const showHeaderValue = showHeaderMatch?.groups?.showHeader.trim() === "true";

    const headerTextMatch = calloutParameters.match(/headerText="(?<headerText>[^"]+)"/);
    const headerTextValue = headerTextMatch?.groups?.headerText.trim() ?? "";

    const calloutTypeMatch = calloutParameters.match(/calloutType="(?<calloutType>[^"]+)"/);
    const calloutTypeValue = calloutTypeMatch?.groups?.calloutType.trim() ?? "conditional";

    const amountIconTextMatch = calloutParameters.match(
      /amountIconText="(?<amountIconText>[^"]+)"/,
    );
    const amountIconTextValue = amountIconTextMatch?.groups?.amountIconText?.trim() ?? "";

    const filingTypeIconTextMatch = calloutParameters.match(
      /filingTypeIconText="(?<filingTypeIconText>[^"]+)"/,
    );
    const filingTypeIconTextValue =
      filingTypeIconTextMatch?.groups?.filingTypeIconText?.trim() ?? "";

    const frequencyIconTextMatch = calloutParameters.match(
      /frequencyIconText="(?<frequencyIconText>[^"]+)"/,
    );
    const frequencyIconTextValue = frequencyIconTextMatch?.groups?.frequencyIconText?.trim() ?? "";

    const phoneIconTextMatch = calloutParameters.match(/phoneIconText="(?<phoneIconText>[^"]+)"/);
    const phoneIconTextValue = phoneIconTextMatch?.groups?.phoneIconText?.trim() ?? "";

    const phoneIconLabelMatch = calloutParameters.match(
      /phoneIconLabel="(?<phoneIconLabel>[^"]+)"/,
    );
    const phoneIconLabelValue = phoneIconLabelMatch?.groups?.phoneIconLabel?.trim() ?? "";

    const emailIconTextMatch = calloutParameters.match(/emailIconText="(?<emailIconText>[^"]+)"/);
    const emailIconTextValue = emailIconTextMatch?.groups?.emailIconText?.trim() ?? "";

    return {
      calloutType: calloutTypeValue,
      showHeader: showHeaderValue,
      headerText: headerTextValue,
      amountIconText: amountIconTextValue,
      filingTypeIconText: filingTypeIconTextValue,
      frequencyIconText: frequencyIconTextValue,
      phoneIconText: phoneIconTextValue,
      phoneIconLabel: phoneIconLabelValue,
      emailIconText: emailIconTextValue,
      body: calloutBody,
    };
  },

  // Function to create a text block from an instance of this component
  toBlock: (obj: {
    showHeader: boolean;
    headerText: string;
    body: string;
    calloutType: string;
    amountIconText: string;
    filingTypeIconText: string;
    frequencyIconText: string;
    phoneIconText: string;
    phoneIconLabel: string;
    emailIconText: string;
  }): string => {
    return `:::largeCallout{ showHeader="${obj.showHeader}" headerText="${obj.headerText}" calloutType="${obj.calloutType}" amountIconText="${obj.amountIconText}" filingTypeIconText="${obj.filingTypeIconText}" frequencyIconText="${obj.frequencyIconText}" phoneIconText="${obj.phoneIconText}" phoneIconLabel="${obj.phoneIconLabel}" emailIconText="${obj.emailIconText}" }\n\n${obj.body}\n\n:::`;
  },
  toPreview: (obj: {
    showHeader: boolean;
    headerText: string;
    body: string;
    calloutType: string;
    amountIconText: string;
    filingTypeIconText: string;
    frequencyIconText: string;
    phoneIconText: string;
    phoneIconLabel: string;
    emailIconText: string;
  }): string => {
    return `:::largeCallout{ showHeader="${obj.showHeader}" headerText="${obj.headerText}" calloutType="${obj.calloutType}" amountIconText="${obj.amountIconText}" filingTypeIconText="${obj.filingTypeIconText}" frequencyIconText="${obj.frequencyIconText}" phoneIconText="${obj.phoneIconText}" phoneIconLabel="${obj.phoneIconLabel}" emailIconText="${obj.emailIconText}" }\n${obj.body}\n:::`;
  },
};
