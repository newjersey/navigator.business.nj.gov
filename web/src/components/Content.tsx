import { useContentModifiedByUserData } from "@/lib/data-hooks/useContentModifiedByUserData";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import { MDXProvider } from "./MDXProvider";

interface ContentProps {
  children: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (url?: string) => void;
  customComponents?: Record<string, React.ReactElement>;
}

export const Content = async (props: ContentProps) => {
  const updatedContent = useContentModifiedByUserData(props.children);

  const mdxSource = await serialize(updatedContent, {
    mdxOptions: {
      remarkPlugins: [
        remarkGfm,
        remarkDirective,
        // Add your custom remark plugin here if needed
      ],
    },
  });

  return (
    <MDXProvider onClick={props.onClick} customComponents={props.customComponents}>
      <div className={props.className} style={props.style}>
        <MDXRemote {...mdxSource} />
      </div>
    </MDXProvider>
  );
};
