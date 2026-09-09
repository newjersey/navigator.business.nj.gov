import { Icon } from "@/components/Icon";

interface PageSectionLinkButtonProps {
  readonly text: string;
  readonly url: string;
}

/**
 * Renders a section's call-to-action as a primary NJWDS button, appending the
 * launch icon when the destination leaves the site.
 */
export const PageSectionLinkButton = ({ text, url }: PageSectionLinkButtonProps) => (
  <a href={url} className="usa-button margin-top-105">
    {text}
    {url.startsWith("http") && <Icon iconName="launch" />}
  </a>
);
