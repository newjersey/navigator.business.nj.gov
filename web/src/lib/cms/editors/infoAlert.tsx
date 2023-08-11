export default {
  id: "infoAlert",
  label: "Info Alert Block",
  fields: [
    {
      name: "header",
      label: "Header Text",
      required: false,
      widget: "string",
    },
    {
      name: "body",
      label: "Body Text",
      required: true,
      widget: "markdown",
    },
  ],

  pattern: /:::infoAlert[^:]+:::/g,
  collapsed: false,
  summary: "{{fields.title}}",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromBlock: (match: any): { header: string; body: string } => {
    const string = match[0];
    const openCurlyIndex = string.indexOf("{");
    const closedCurlyIndex = string.indexOf("}");

    const headerValue =
      openCurlyIndex < 0
        ? undefined
        : string
            .slice(openCurlyIndex + 1, closedCurlyIndex)
            .trim()
            .split("=")[1]
            .slice(1, -1);

    const hasHeader = openCurlyIndex >= 0;
    const startLength = ":::infoAlert".length;
    const endLength = ":::".length;
    const body = hasHeader
      ? string.slice(closedCurlyIndex + 1, -1 * endLength).trim()
      : string.slice(startLength, -1 * endLength);

    return {
      header: headerValue,
      body: body,
    };
  },
  // Function to create a text block from an instance of this component
  toBlock: (obj: { header?: string; body: string }): string => {
    if (obj.header) {
      return `:::infoAlert{ header="${obj.header}" } \n ${obj.body ? obj.body.trim() : ""}\n:::`;
    }
    return `:::infoAlert \n ${obj.body ? obj.body.trim() : ""}\n:::`;
  },

  toPreview: (obj: { header?: string; body: string }): string => {
    if (obj.header) {
      return `:::infoAlert{ header="${obj.header}" } \n ${obj.body ? obj.body.trim() : ""}\n:::`;
    }
    return `:::infoAlert \n ${obj.body ? obj.body.trim() : ""}\n:::`;
  },
};
