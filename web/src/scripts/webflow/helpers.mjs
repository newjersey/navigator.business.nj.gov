import rehypeFormat from "rehype-format";
import rehypeRaw from "rehype-raw";
import rehypeRewrite from "rehype-rewrite";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export const wait = (milliseconds = 10000) => {
  return new Promise((resolve) => {
    return setTimeout(resolve, milliseconds);
  });
};

export const argsInclude = (query) => {
  return process.argv.some((i) => {
    return i.includes(query);
  });
};

/*
  takes content in markdown Navigator-specific format
  returns array of lines
 */
export const contentToStrings = (content) => {
  let result = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeRewrite, {
      selector: "code",
      rewrite: (node) => {
        const obj = node.children[0];
        if (obj.value.includes("|")) {
          node.type = "text";
          node.value = obj.value.split("|")[0];
          delete node.children;
          delete node.properties;
          delete node.tagName;
        }
      },
    })
    .use(rehypeFormat)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .processSync(content).value;

  const itemsToRemove = ["<blockquote>", "</blockquote>", "<hr>", ":::infoAlert", ":::", /(\[]{.*})/g];
  itemsToRemove.map((i) => {
    return (result = result.replaceAll(i, ""));
  });

  return result.split("\n");
};

/*
  takes content lines as array of strings
  returns html formatting for selected start->stop lines
  start and stop are optional - if unpassed, will return entire array
 */
export const getHtml = (arrayOfStrings, start, stop) => {
  return arrayOfStrings
    .slice(start, stop)
    .map((i) => {
      return i.trim();
    })
    .join(" ")
    .trim();
};
