import rehypeFormat from "rehype-format";
import rehypeRaw from "rehype-raw";
import rehypeRewrite from "rehype-rewrite";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { wait } from "./helpers2.mjs";

const RATE_LIMIT_WAIT_SECONDS = 20;

export const argsInclude = (query) => {
  return process.argv.some((i) => {
    return i.includes(query);
  });
};

export const checkRateLimitAndWait = async (response) => {
  if (
    response &&
    response.headers &&
    response.headers["x-ratelimit-remaining"] &&
    response.headers["x-ratelimit-remaining"] <= 5
  ) {
    console.debug(`Rate limit close; waiting ${RATE_LIMIT_WAIT_SECONDS} seconds...`);
    await wait(RATE_LIMIT_WAIT_SECONDS * 1000);
  }
};

export const resolveApiPromises = async (promiseArray) => {
  if (promiseArray.length === 0) {
    console.info("0 things to be acted on");
  }
  for (const promise of promiseArray) {
    const response = await promise();
    await checkRateLimitAndWait(response);
  }
};

export const catchRateLimitErrorAndRetry = async (error, retryFunc, ...params) => {
  console.debug("in Catch Rate and retry");
  if (error.response.status === 429) {
    console.debug("Catching rate limit error hit");
    await wait(65000);
    // eslint-disable-next-line no-useless-catch
    try {
      return await retryFunc(...params);
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else {
    console.error(error);
    throw error;
  }
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
