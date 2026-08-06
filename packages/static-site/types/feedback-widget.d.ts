/**
 * Declares the NJ feedback widget custom element for JSX.
 *
 * `@newjersey/feedback-widget` registers a framework-agnostic custom element
 * and ships no type definitions, so TypeScript needs the tag declared before
 * it can appear in JSX. React 19 scopes the `JSX` namespace inside the `react`
 * module rather than exposing a global one, so this augments that module.
 */

import type { DetailedHTMLProps, HTMLAttributes } from "react";

/**
 * Attributes accepted by the `<feedback-widget>` element.
 *
 * Mirrors the attribute list documented in the widget's README. Values are
 * strings because custom element attributes are always serialized, including
 * the boolean-like ones which expect the literal text `"true"` or `"false"`.
 */
interface FeedbackWidgetAttributes
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  /** Destination for the widget's "contact us" link. */
  "contact-link"?: string;
  /** When `"true"`, ratings go to analytics only and skip the datastore. */
  "only-save-rating-to-analytics"?: string;
  /** When `"false"`, hides the disclaimer shown above the comment field. */
  "show-comment-disclaimer"?: string;
  /** When `"true"`, omits the email collection step. */
  "skip-email-step"?: string;
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      /** NJ feedback widget custom element. */
      "feedback-widget": FeedbackWidgetAttributes;
    }
  }
}
