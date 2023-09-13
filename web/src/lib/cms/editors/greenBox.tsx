export default {
  id: "greenBox",
  label: "Green Box Block",
  fields: [
    {
      name: "body",
      label: "Body Text",
      required: true,
      widget: "markdown",
    },
  ],

  pattern: /:::greenBox[^:]+:::/g,
  collapsed: false,
  summary: "{{fields.title}}",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromBlock: (match: any): { body: string } => {
    const string = match[0];
    const startLength = ":::greenBox".length;
    const endLength = ":::".length;
    const body = string.slice(startLength, -1 * endLength);
    return {
      body: body,
    };
  },
  // Function to create a text block from an instance of this component
  toBlock: (obj: { body: string }): string => {
    return `:::greenBox \n ${obj.body ? obj.body.trim() : ""}\n:::`;
  },

  toPreview: (obj: { body: string }): string => {
    return `:::greenBox \n ${obj.body ? obj.body.trim() : ""}\n:::`;
  },
};
