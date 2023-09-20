export default {
  id: "infoAlert",
  label: "Info Alert Block",
  fields: [
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
  fromBlock: (match: any): { body: string } => {
    const string = match[0];

    const startLength = ":::infoAlert".length;
    const endLength = ":::".length;
    const body = string.slice(startLength, -1 * endLength);

    return {
      body: body,
    };
  },
  // Function to create a text block from an instance of this component
  toBlock: (obj: { body: string }): string => {
    return `:::infoAlert \n ${obj.body ? obj.body.trim() : ""}\n:::`;
  },

  toPreview: (obj: { body: string }): string => {
    return `:::infoAlert \n ${obj.body ? obj.body.trim() : ""}\n:::`;
  },
};
