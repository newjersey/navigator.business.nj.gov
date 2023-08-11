/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactElement } from "react";
import rehypeReact from "rehype-react";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
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
      createElement: React.createElement,
      Fragment: React.Fragment,
      components: props.components,
    })
    .processSync(props.children).result;
  return <>{markdown}</>;
};

type hProperties = {
  header?: any;
  type?: any;
};

function setNodeValues(node: any, nodeName: string, hProperties: hProperties): void {
  if (node.name === nodeName) {
    const data = node.data || (node.data = {});
    data.hName = nodeName;
    data.hProperties = hProperties;
  }
}

function customRemarkPlugin():
  | void
  | import("unified").Transformer<import("mdast").Root, import("mdast").Root> {
  return (tree: any) => {
    visit(tree, (node) => {
      if (node.type === "containerDirective") {
        setNodeValues(node, "infoAlert", { header: node.attributes.header });
        setNodeValues(node, "greenBox", { header: node.attributes.header });
        setNodeValues(node, "note", { header: node.attributes.header });
        setNodeValues(node, "icon", { type: node.attributes.type });
      } else {
        return;
      }
    });
  };
}
