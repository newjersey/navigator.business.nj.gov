export default {
  id: "context-info",
  label: "Contextual Information Block",
  fields: [
    {
      name: "preFormat",
      label: "preFormat",
      widget: "hidden",
    },
    {
      name: "preContext",
      label: "Pre-Context Markdown",
      widget: "markdown",
      required: false,
      minimal: true,
    },
    {
      name: "title",
      label: "Context Info Title",
      required: true,

      widget: "string",
    },
    {
      name: "contextId",
      label: "Contextual Info Panel Id",
      required: true,
      widget: "relation",
      collection: "contextual-information",
      search_fields: ["{{filename}}"],
      value_field: "{{filename}}",
      display_fields: ["{{filename}}"],
    },

    {
      name: "postContext",
      label: "Post-Context Markdown",
      buttons: ["bold", "italic", "code", "link"],
      widget: "markdown",
      required: false,
      minimal: true,
    },
    {
      name: "postFormat",
      label: "postFormat",
      widget: "hidden",
    },
  ],

  pattern: /(^\**)(.*)`(.*)\|(.*)`(.*?)(\**$)/,
  collapsed: true,
  summary: "{{fields.title}}",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromBlock: (match: any) => ({
    preFormat: match[1],
    preContext: match[2],
    title: match[3],
    contextId: match[4],
    postContext: match[5],
    postFormat: match[6],
  }),
  // Function to create a text block from an instance of this component
  toBlock: (obj: {
    preFormat: string;
    preContext: string;
    title: string;
    contextId: string;
    postContext: string;
    postFormat: string;
  }) =>
    `${obj.preFormat || ""}${(obj.preContext || "").trim()} \`${(obj.title || "").trim()}|${
      obj.contextId || ""
    }\` ${(obj.postContext || "").trim()}${obj.postFormat || ""}`,

  toPreview: () => `<div></div>`,
};
