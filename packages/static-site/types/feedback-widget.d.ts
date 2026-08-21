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
 * Mirrors the attribute list documented in the widget's README. Custom element
 * attributes are always serialized, so the boolean options take the literal
 * text `"true"` or `"false"` rather than a JSX boolean.
 */
interface FeedbackWidgetAttributes
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  /** Destination for the widget's "contact us" link. */
  "contact-link"?: string;
  /** When `"true"`, ratings go to analytics only and skip the datastore. */
  "only-save-rating-to-analytics"?: "true" | "false";
  /** When `"false"`, hides the disclaimer shown above the comment field. */
  "show-comment-disclaimer"?: "true" | "false";
  /** When `"true"`, omits the email collection step. */
  "skip-email-step"?: "true" | "false";
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      /** NJ feedback widget custom element. */
      "feedback-widget": FeedbackWidgetAttributes;
    }
  }
}
