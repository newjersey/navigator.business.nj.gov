/**
 * Declares the published NJ feedback widget bundle, which ships no types.
 *
 * `@newjersey/feedback-widget` publishes a single minified `.js` file with no
 * `types` entry, so importing it under `strict` would otherwise be an implicit
 * `any`. The bundle is imported purely for its side effect of calling
 * `window.customElements.define`, so it needs no member types.
 *
 * This declaration must stay in a file with no top-level `import` or `export`.
 * A file containing either becomes a module, which turns `declare module` into
 * an augmentation of an existing module rather than an ambient declaration for
 * an untyped one. That is why it cannot live in `feedback-widget.d.ts`, which
 * imports from `react` to declare the element's JSX attributes.
 */

declare module "@newjersey/feedback-widget/feedback-widget.min.js";
