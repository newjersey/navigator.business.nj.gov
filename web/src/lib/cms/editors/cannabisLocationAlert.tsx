export default {
  id: "cannabisLocationAlert",
  label: "Cannabis Location Alert",
  fields: [],
  pattern: /:::cannabisLocationAlert[^:]+:::/g,
  collapsed: false,
  summary: "{{fields.title}}",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromBlock: (match: any): { body: string } => {
    const string = match[0];
    const startLength = ":::cannabisLocationAlert".length;
    const endLength = ":::".length;
    const body = string.slice(startLength, -1 * endLength);
    return {
      body: body,
    };
  },
  // Function to create a text block from an instance of this component
  toBlock: (obj: { body: string }): string => {
    return `:::cannabisLocationAlert \n ${obj.body ? obj.body.trim() : ""}\n:::`;
  },

  toPreview: (obj: { body: string }): string => {
    return `:::cannabisLocationAlert \n ${obj.body ? obj.body.trim() : ""}\n:::`;
  },
};
