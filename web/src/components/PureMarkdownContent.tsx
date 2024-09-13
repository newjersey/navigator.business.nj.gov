/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactElement } from "react";
import rehypeReact from "rehype-react";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { type Plugin, unified } from "unified";
import { visit } from "unist-util-visit";

interface Props {
  children: string;
  components?: { [key: string]: { ({ children }: { children: string[] }): ReactElement } };
}

export const PureMarkdownContent = (props: Props): ReactElement => {
  const markdown = unified()
    .use(remarkParse) // remark plugin to add support for parsing markdown input
    .use(remarkGfm) // plugin to support GFM (autolink literals, footnotes, strikethrough, tables, tasklists)
    .use(remarkDirective) // remark plugin to support directives i.e. :::infoAlert
    .use(customRemarkPlugin) // custom - used to modify custom directives
    .use(remarkRehype) // remark plugin that turns markdown into HTML to support rehype
    .use(rehypeReact, {
      createElement: React.createElement,
      Fragment: React.Fragment,
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
          case "callout":
            data.hProperties = {
              headerText: node.attributes.headerText?.length > 0 ? node.attributes.headerText : undefined,
              showHeader: node.attributes.showHeader === "true",
              showIcon: node.attributes.showIcon === "true",
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
