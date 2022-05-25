import React, { ReactElement } from "react";
import rehypeReact from "rehype-react";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

interface Props {
  children: string;
  components?: { [key: string]: { ({ children }: { children: string[] }): ReactElement } };
}

export const PureMarkdownContent = (props: Props): ReactElement => {
  const markdown = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeReact, {
      createElement: React.createElement,
      Fragment: React.Fragment,
      components: props.components,
    })
    .processSync(props.children).result;
  return <>{markdown}</>;
};
