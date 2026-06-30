/**
 * Renders the stateless preferred-language prompt modal markup.
 *
 * This presentational atom renders a dialog with focus-trap and backdrop
 * behavior managed in React. The molecule controls visibility via the
 * `isOpen` prop.
 */

"use client";

import { useEffect, useRef } from "react";

/**
 * Element id for the modal heading, referenced by `aria-labelledby`.
 */
const MODAL_HEADING_ID = "language-prompt-modal-heading";

/**
 * Element id for the modal body, referenced by `aria-describedby`.
 */
const MODAL_DESCRIPTION_ID = "language-prompt-modal-description";

/**
 * Describes props accepted by the language prompt modal view.
 *
 * This type defines a stable shape for related data.
 */
export interface LanguagePromptModalViewProps {
  /** Modal heading text. */
  readonly title: string;
  /** Body text describing the offered language choice. */
  readonly body: string;
  /** Label for the button that keeps the visitor on the current page. */
  readonly stayLabel: string;
  /** Accessible label for the close control. */
  readonly closeLabel: string;
  /** Resolved redirect button label including the target language name. */
  readonly redirectLabel: string;
  /** Handler invoked when the visitor chooses to stay on the page. */
  readonly onStay: () => void;
  /** Handler invoked when the visitor chooses to switch language. */
  readonly onRedirect: () => void;
  /** Whether the modal is currently visible. */
  readonly isOpen: boolean;
}

/**
 * Renders the preferred-language prompt modal.
 *
 * @param props Component props.
 * @param props.title Modal heading text.
 * @param props.body Body text describing the choice.
 * @param props.stayLabel Label for the stay button.
 * @param props.closeLabel Accessible label for the close control.
 * @param props.redirectLabel Resolved redirect button label.
 * @param props.onStay Handler for the stay action.
 * @param props.onRedirect Handler for the redirect action.
 * @param props.isOpen Whether the modal is currently visible.
 * @returns The modal markup, or null when closed.
 * @example
 * ```tsx
 * <LanguagePromptModalView
 *   title="View this page in your language?"
 *   body="..."
 *   stayLabel="Stay"
 *   closeLabel="Close"
 *   redirectLabel="Switch to Español"
 *   onStay={handleStay}
 *   onRedirect={handleRedirect}
 *   isOpen={true}
 * />
 * ```
 */
export const LanguagePromptModalView = ({
  title,
  body,
  stayLabel,
  closeLabel,
  redirectLabel,
  onStay,
  onRedirect,
  isOpen,
}: LanguagePromptModalViewProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onStay();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onStay]);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const focusable = dialogRef.current.querySelector<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );
      focusable?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="usa-modal-wrapper is-visible">
      <div className="usa-modal-overlay" aria-hidden="true" onClick={onStay} />
      <div
        aria-describedby={MODAL_DESCRIPTION_ID}
        aria-labelledby={MODAL_HEADING_ID}
        aria-modal="true"
        className="usa-modal"
        ref={dialogRef}
        role="dialog"
      >
        <div className="usa-modal__content">
          <div className="usa-modal__main">
            <h2 className="usa-modal__heading" id={MODAL_HEADING_ID}>
              {title}
            </h2>
            <div className="usa-prose">
              <p id={MODAL_DESCRIPTION_ID}>{body}</p>
            </div>
            <div className="usa-modal__footer">
              <ul className="usa-button-group">
                <li className="usa-button-group__item">
                  <button className="usa-button" onClick={onRedirect} type="button">
                    {redirectLabel}
                  </button>
                </li>
                <li className="usa-button-group__item">
                  <button
                    className="usa-button usa-button--unstyled padding-105 text-center"
                    onClick={onStay}
                    type="button"
                  >
                    {stayLabel}
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <button
            aria-label={closeLabel}
            className="usa-button usa-modal__close"
            onClick={onStay}
            type="button"
          >
            <svg aria-hidden="true" className="usa-icon" focusable="false" role="img">
              <use xlinkHref="/assets/njwds/dist/img/sprite.svg#close" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
