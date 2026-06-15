/**
 * Renders the stateless preferred-language prompt modal markup.
 *
 * This presentational atom mirrors the NJWDS `usa-modal` structure and exposes
 * a visually-hidden `data-open-modal` trigger via `ref`. NJWDS ships no
 * programmatic open API, so the molecule opens the modal by clicking that
 * hidden trigger; the bundled `toggleModal` handler then runs its focus-trap
 * and inert logic. All decision logic lives in the molecule, keeping this
 * component trivial to render and audit for accessibility.
 */

import type { Ref } from "react";

/**
 * Element id linking the open trigger to the modal container.
 */
const MODAL_ID = "language-prompt-modal";

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
  /** Ref to the hidden open trigger so the molecule can open the modal. */
  readonly openTriggerRef: Ref<HTMLButtonElement>;
}

/**
 * Renders the preferred-language prompt modal and its hidden open trigger.
 *
 * @param props Component props.
 * @param props.title Modal heading text.
 * @param props.body Body text describing the choice.
 * @param props.stayLabel Label for the stay button.
 * @param props.closeLabel Accessible label for the close control.
 * @param props.redirectLabel Resolved redirect button label.
 * @param props.onStay Handler for the stay action.
 * @param props.onRedirect Handler for the redirect action.
 * @param props.openTriggerRef Ref to the hidden open trigger.
 * @returns The modal markup and its hidden trigger.
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
 *   openTriggerRef={triggerRef}
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
  openTriggerRef,
}: LanguagePromptModalViewProps) => {
  return (
    <>
      <button
        aria-controls={MODAL_ID}
        aria-hidden="true"
        data-open-modal
        ref={openTriggerRef}
        style={{ position: "fixed", top: 0, insetInlineStart: "-9999px" }}
        tabIndex={-1}
        type="button"
      >
        {title}
      </button>
      {/* No role="dialog" or aria-modal here: the NJWDS modal script moves the
          dialog role and the id/aria-labelledby/aria-describedby onto the
          .usa-modal-wrapper it generates, and that wrapper is the real dialog.
          Declaring role="dialog" here too would leave a second, unnamed dialog
          (fails aria-dialog-name), and aria-modal without a dialog role is
          invalid (fails aria-allowed-attr). The aria-labelledby/describedby
          stay because the script reads them from here. */}
      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: the NJWDS modal script requires aria-labelledby/describedby on .usa-modal — it reads them to label the .usa-modal-wrapper it generates (and throws if absent). The role lives on that wrapper, not here. */}
      <div
        aria-describedby={MODAL_DESCRIPTION_ID}
        aria-labelledby={MODAL_HEADING_ID}
        className="usa-modal"
        id={MODAL_ID}
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
                    data-close-modal
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
            data-close-modal
            onClick={onStay}
            type="button"
          >
            <svg aria-hidden="true" className="usa-icon" focusable="false" role="img">
              <use xlinkHref="/assets/njwds/dist/img/sprite.svg#close" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};
