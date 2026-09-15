import { type AnchorHTMLAttributes, isValidElement, type ReactNode } from "react";
import Markdown, { type Components } from "react-markdown";

/**
 * Reserved Markdown link target that opens the Intercom messenger instead of
 * navigating. Content authors write `[Chat with us](#open-chat)`. No element
 * carries this id and neither `PageContent` nor `PageProse` adds a
 * heading-slug plugin, so the sentinel can never shadow a real in-page anchor.
 */
export const INTERCOM_LAUNCHER_HREF = "#open-chat";

/**
 * Matches the YouTube embed href form (`https://www.youtube.com/embed/<id>`)
 * that content authors use to opt a video into an inline player. The
 * `watch?v=` form is deliberately not matched, so authors keep the ability to
 * link out to a video instead of embedding it.
 */
const YOUTUBE_EMBED_HREF = /^https:\/\/www\.youtube\.com\/embed\/([\w-]{11})(?:\?[^#]*)?$/;

/**
 * Returns the canonical embed src for a YouTube embed href, or `undefined` for
 * anything else. The src is rebuilt from the captured video id rather than
 * reusing the authored href, so untrusted CMS input can never steer the frame
 * anywhere but a YouTube video. Any query string YouTube's share dialog appends
 * (`?si=…`) is tolerated on input and dropped from the src.
 */
const parseYouTubeEmbedSrc = (href: string): string | undefined => {
  const videoId = href.match(YOUTUBE_EMBED_HREF)?.[1];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : undefined;
};

/**
 * Flattens a Markdown link's rendered children to plain text, used as an
 * embedded player's accessible name so the copy stays authored in content
 * rather than hardcoded here.
 */
const extractLinkText = (children: ReactNode): string => {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractLinkText).join("");
  if (isValidElement<{ children?: ReactNode }>(children)) {
    return extractLinkText(children.props.children);
  }
  return "";
};

/**
 * Renders the reserved Intercom sentinel link as a launcher button, a
 * YouTube embed link as an inline player, or any other Markdown link as a
 * plain anchor. The `.intercomlaunch` class is the selector
 * `components/analytics/Intercom.tsx` binds the messenger to, and
 * `.text-link-button` makes the button read like the links around it. A
 * `button` is phrasing content, so it stays valid inside the `p` that
 * `Markdown` wraps prose in, and its text children supply its accessible name.
 */
const renderMarkdownAnchor = ({ href, children }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
  if (href === INTERCOM_LAUNCHER_HREF) {
    return (
      <button className="text-link-button intercomlaunch" type="button">
        {children}
      </button>
    );
  }

  // An `iframe` is phrasing content, so it stays valid inside the `p` that
  // `Markdown` wraps prose in — the same reason the launcher above is a
  // `button` and not a `div`-wrapped player. A frame with no accessible name
  // fails WCAG, so an embed href with no link text degrades to a plain anchor
  // rather than rendering an untitled player.
  const embedSrc = href ? parseYouTubeEmbedSrc(href) : undefined;
  const embedTitle = extractLinkText(children).trim();

  if (embedSrc && embedTitle) {
    return (
      <iframe
        allowFullScreen
        className="video-embed"
        loading="lazy"
        src={embedSrc}
        title={embedTitle}
      />
    );
  }

  return <a href={href}>{children}</a>;
};

const markdownComponents: Components = { a: renderMarkdownAnchor };

interface PageProseProps {
  readonly body: string;
}

/**
 * Renders a Markdown body string as prose, applying the shared anchor
 * behavior above. Server-safe.
 */
export const PageProse = ({ body }: PageProseProps): ReactNode => (
  <div className="usa-prose">
    <Markdown components={markdownComponents}>{body}</Markdown>
  </div>
);
