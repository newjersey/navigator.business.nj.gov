import { allInlineIconTypes } from "@/lib/cms/types";

export default {
  id: "icon",
  label: "Inline Icon",
  fields: [
    {
      name: "type",
      label: "Icon Type",
      required: true,
      widget: "select",
      options: allInlineIconTypes
    },
    {
      name: "body",
      label: "Body Text",
      required: true,
      widget: "markdown"
    }
  ],

  pattern: /:::icon[^:]+:::/g,
  collapsed: false,
  summary: "{{fields.title}}",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromBlock: (match: any): { type: string; body: string } => {
    const string = match[0];
    const openCurlyIndex = string.indexOf("{");
    const closedCurlyIndex = string.indexOf("}");

    const typeValue =
      openCurlyIndex < 0
        ? undefined
        : string
            .slice(openCurlyIndex + 1, closedCurlyIndex)
            .trim()
            .split("=")[1]
            .slice(1, -1);

    const endLength = ":::".length;
    const body = string.slice(closedCurlyIndex + 1, -1 * endLength).trim();
    return { type: typeValue, body: body };
  },
  // Function to create a text block from an instance of this component
  toBlock: (obj: { type: string; body: string }): string => {
    return `:::icon{ type="${obj.type}" } \n ${obj.body.trim()}\n:::`;
  },

  toPreview: (obj: { type: string; body: string }): string => {
    return `:::icon{ type="${obj.type}" } \n ${obj.body.trim()}\n:::`;
  }
};
1;
