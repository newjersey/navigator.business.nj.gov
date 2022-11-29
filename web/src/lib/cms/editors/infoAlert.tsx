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
  fromBlock: (match: any) => {
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

    const body = openCurlyIndex < 0 ? string.slice(11, -3) : string.slice(closedCurlyIndex + 1, -3).trim();

    return {
      header: headerValue,
      body: body,
    };
  },
  // Function to create a text block from an instance of this component
  toBlock: (obj: { header?: string; body: string }) => {
    if (obj.header) {
      return `:::infoAlert{ header="${obj.header}" } \n ${obj.body}\n:::`;
    }
    return `:::infoAlert \n ${obj.body}\n:::`;
  },

  toPreview: (obj: { header?: string; body: string }) => {
    if (obj.header) {
      return `:::infoAlert{ header="${obj.header}" } \n ${obj.body}\n:::`;
    }
    return `:::infoAlert \n ${obj.body}\n:::`;
  },
};
