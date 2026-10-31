import type { Root } from "mdast";
import type { ReactElement, ReactNode } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeReact from "rehype-react";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { type Plugin, unified } from "unified";
import { visit } from "unist-util-visit";

// rehype-react builds each component's props from markdown at runtime, so their prop types
// can't be checked against the markdown here; `never` accepts a component with any props.
export type MarkdownComponents = Record<string, (props: never) => ReactNode>;

interface Props {
  children: string;
  components?: MarkdownComponents;
}

export const PureMarkdownContent = (props: Props): ReactElement => {
  const markdown = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(customRemarkPlugin)
    .use(remarkRehype)
    .use(rehypeReact, {
      Fragment,
      jsx,
      jsxs,
      components: props.components,
    })
    .processSync(props.children).result;
  return <>{markdown}</>;
};

const customRemarkPlugin: Plugin = () => {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (node.type === "containerDirective") {
        node.data ||= {};
        const data = node.data;
        data.hName = node.name;
        // remark-directive always parses attributes into an object of strings; the types also allow
        // null for hand-built nodes.
        const attributes = node.attributes ?? {};
        switch (node.name) {
          case "cannabisLocationAlert":
          case "note":
            data.hProperties = { header: attributes.header };
            break;
          case "largeCallout":
            data.hProperties = {
              headerText:
                (attributes.headerText?.length ?? 0) > 0 ? attributes.headerText : undefined,
              showHeader: attributes.showHeader === "true",
              calloutType: attributes.calloutType,
              amountIconText:
                (attributes.amountIconText?.length ?? 0) > 0
                  ? attributes.amountIconText
                  : undefined,
              filingTypeIconText:
                (attributes.filingTypeIconText?.length ?? 0) > 0
                  ? attributes.filingTypeIconText
                  : undefined,
              frequencyIconText:
                (attributes.frequencyIconText?.length ?? 0) > 0
                  ? attributes.frequencyIconText
                  : undefined,
              phoneIconText:
                (attributes.phoneIconText?.length ?? 0) > 0 ? attributes.phoneIconText : undefined,
              emailIconText:
                (attributes.emailIconText?.length ?? 0) > 0 ? attributes.emailIconText : undefined,
            };
            break;
          case "miniCallout":
            data.hProperties = {
              headerText: attributes.headerText,
              calloutType: attributes.calloutType,
              hideIcon: attributes.hideIcon === "true",
            };
            break;
          case "icon":
            data.hProperties = { type: attributes.type ?? undefined };
            break;
        }
      } else {
        return;
      }
    });
  };
};
