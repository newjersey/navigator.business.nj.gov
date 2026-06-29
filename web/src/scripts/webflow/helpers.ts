import type { Element, Root, RootContent } from "hast";
import rehypeFormat from "rehype-format";
import rehypeRaw from "rehype-raw";
import rehypeRewrite from "rehype-rewrite";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { FetchResponse } from "./types";

const RATE_LIMIT_WAIT_SECONDS = 20;

export const argsInclude = (query: string): boolean => {
  return process.argv.some((i) => {
    return i.includes(query);
  });
};

export const checkRateLimitAndWait = async (response: FetchResponse): Promise<void> => {
  if (response && response.headers) {
    const rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
    if (rateLimitRemaining && Number(rateLimitRemaining) <= 5) {
      console.debug(`Rate limit close; waiting ${RATE_LIMIT_WAIT_SECONDS} seconds...`);
      await wait(RATE_LIMIT_WAIT_SECONDS * 1000);
    }
  }
};

export const resolveApiPromises = async (
  promiseArray: Array<() => Promise<FetchResponse | void>>,
): Promise<void> => {
  if (promiseArray.length === 0) {
    console.info("0 things to be acted on");
  }
  for (const promise of promiseArray) {
    const response = await promise();
    await checkRateLimitAndWait(response as FetchResponse);
  }
};

export const catchRateLimitErrorAndRetry = async <T extends unknown[]>(
  error: unknown,
  retryFunc: (...params: T) => Promise<FetchResponse>,
  ...params: T
): Promise<FetchResponse | void> => {
  console.debug("in Catch Rate and retry");
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "status" in error.response &&
    error.response.status === 429
  ) {
    console.debug("Catching rate limit error hit");
    await wait(65000);
    try {
      return await retryFunc(...params);
    } catch (retryError) {
      console.error(retryError);
      throw retryError;
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
export const contentToStrings = (content: string): string[] => {
  let result = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeRewrite, {
      selector: "code",
      rewrite: (node: Root | RootContent) => {
        if (node.type !== "element") return;
        const element = node as Element;
        const child = element.children?.[0];
        if (child?.type === "text" && child.value.includes("|")) {
          const textNode = node as unknown as { type: string; value: string };
          textNode.type = "text";
          textNode.value = child.value.split("|")[0];
          delete (node as Partial<Element>).children;
          delete (node as Partial<Element>).properties;
          delete (node as Partial<Element>).tagName;
        }
      },
    })
    .use(rehypeFormat)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .processSync(content).value as string;

  const itemsToRemove: Array<string | RegExp> = [
    "<blockquote>",
    "</blockquote>",
    "<hr>",
    ":::infoAlert",
    ":::callout",
    ":::largeCallout",
    ":::miniCallout",
    ":::",
    /(\[]{.*})/g,
  ];
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
export const getHtml = (arrayOfStrings: string[], start?: number, stop?: number): string => {
  return arrayOfStrings
    .slice(start, stop)
    .map((i) => {
      return i.trim();
    })
    .join(" ")
    .trim();
};

export const wait = (milliseconds: number = 10000): Promise<void> => {
  return new Promise((resolve) => {
    return setTimeout(resolve, milliseconds);
  });
};
