/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Jsx, JsxDev } from "hast-util-to-jsx-runtime";
import { ReactElement } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeReact, { type Options } from "rehype-react";
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
  const rehypeReactOptions: Options = {
    Fragment: Fragment,
    components: props.components,
    development: process.env.NODE_ENV === "development",
    jsx: jsx as Jsx,
    jsxs: jsxs as Jsx,
    jsxDEV: jsxs as JsxDev,
  };

  const markdown = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(customRemarkPlugin)
    .use(remarkRehype)
    .use(rehypeReact, rehypeReactOptions)
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
          case "greenBox":
          case "note":
            data.hProperties = { header: node.attributes.header };
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
