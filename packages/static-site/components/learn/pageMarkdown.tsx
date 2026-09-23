import { type AnchorHTMLAttributes, isValidElement, type ReactNode } from "react";
import Markdown, { type Components } from "react-markdown";

/** Sentinel href, e.g. `[Chat with us](#open-chat)`, that opens Intercom instead of navigating. */
export const INTERCOM_LAUNCHER_HREF = "#open-chat";

/** Matches YouTube's `/embed/<id>` form. `watch?v=` is excluded so authors can still link out instead of embedding. */
const YOUTUBE_EMBED_HREF = /^https:\/\/www\.youtube\.com\/embed\/([\w-]{11})(?:\?[^#]*)?$/;

/**
 * Returns a safe embed src for a YouTube embed href, or `undefined` otherwise.
 * Rebuilt from the captured video id, not the authored href, so untrusted CMS
 * input can never steer the frame elsewhere.
 */
const parseYouTubeEmbedSrc = (href: string): string | undefined => {
  const videoId = href.match(YOUTUBE_EMBED_HREF)?.[1];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : undefined;
};

/** Flattens a Markdown link's children to plain text, used as the embed's accessible name. */
const extractLinkText = (children: ReactNode): string => {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractLinkText).join("");
  if (isValidElement<{ children?: ReactNode }>(children)) {
    return extractLinkText(children.props.children);
  }
  return "";
};

// `button`/`iframe` are phrasing content, so both stay valid inside the `p` Markdown wraps prose in.
// `.intercomlaunch` is the selector Intercom.tsx binds the messenger to; `.text-link-button` matches link styling.
const renderIntercomLauncher = (children: ReactNode): ReactNode => (
  <button className="text-link-button intercomlaunch" type="button">
    {children}
  </button>
);

const renderYouTubeEmbed = (src: string, title: string): ReactNode => (
  <iframe allowFullScreen className="video-embed" loading="lazy" src={src} title={title} />
);

/** Falls through to a plain anchor if an embed link has no title, since an untitled iframe fails WCAG. */
const renderMarkdownAnchor = ({ href, children }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
  if (href === INTERCOM_LAUNCHER_HREF) return renderIntercomLauncher(children);

  const embedSrc = href ? parseYouTubeEmbedSrc(href) : undefined;
  if (embedSrc) {
    const embedTitle = extractLinkText(children).trim();
    if (embedTitle) return renderYouTubeEmbed(embedSrc, embedTitle);
  }

  return <a href={href}>{children}</a>;
};

const markdownComponents: Components = { a: renderMarkdownAnchor };

interface PageProseProps {
  readonly body: string;
}

/** Renders a Markdown body string as prose, applying the anchor overrides above. Server-safe. */
export const PageProse = ({ body }: PageProseProps): ReactNode => (
  <div className="usa-prose">
    <Markdown components={markdownComponents}>{body}</Markdown>
  </div>
);
