/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactElement } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeReact from "rehype-react";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified, type Plugin } from "unified";
import { visit } from "unist-util-visit";

interface Props {
  children: string;
  components?: { [key: string]: { ({ children }: { children: string[] }): ReactElement } };
}

export const PureMarkdownContent = (props: Props): ReactElement => {
  const markdown = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(customRemarkPlugin)
    .use(remarkRehype)
    .use(rehypeReact, {
      jsx,
      jsxs,
      Fragment,
      components: props.components,
    })
    .processSync(props.children).result;
  return <>{markdown}</>;
};

const customRemarkPlugin: Plugin = () => {
  return (tree: any) => {
    visit(tree, (node) => {
      if (node.type === "containerDirective") {
        const data = node.data || (node.data = {});
        data.hName = node.name;
        switch (node.name) {
          case "cannabisLocationAlert":
          case "note":
            data.hProperties = { header: node.attributes.header };
            break;
          case "largeCallout":
            data.hProperties = {
              headerText:
                node.attributes.headerText?.length > 0 ? node.attributes.headerText : undefined,
              showHeader: node.attributes.showHeader === "true",
              calloutType: node.attributes.calloutType,
              amountIconText:
                node.attributes.amountIconText?.length > 0
                  ? node.attributes.amountIconText
                  : undefined,
              filingTypeIconText:
                node.attributes.filingTypeIconText?.length > 0
                  ? node.attributes.filingTypeIconText
                  : undefined,
              frequencyIconText:
                node.attributes.frequencyIconText?.length > 0
                  ? node.attributes.frequencyIconText
                  : undefined,
              phoneIconText:
                node.attributes.phoneIconText?.length > 0
                  ? node.attributes.phoneIconText
                  : undefined,
              emailIconText:
                node.attributes.emailIconText?.length > 0
                  ? node.attributes.emailIconText
                  : undefined,
            };
            break;
          case "miniCallout":
            data.hProperties = {
              headerText: node.attributes.headerText,
              calloutType: node.attributes.calloutType,
            };
            break;
          case "icon":
            data.hProperties = { type: node.attributes.type };
            break;
        }
      } else {
        return;
      }
    });
  };
};
