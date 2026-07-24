import {
  CSSProperties,
  ReactElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

interface Props {
  text: string;
  dataTestId?: string;
  viewMoreText: string;
  viewLessText: string;
  lines: number;
}

export const ExpandCollapseString = (props: Props): ReactElement => {
  const contentId = useId();
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  const updateCanExpand = useCallback((): void => {
    if (!contentRef.current || isExpanded) {
      return;
    }

    setCanExpand(contentRef.current.scrollHeight > contentRef.current.clientHeight);
  }, [isExpanded]);

  useEffect(() => {
    updateCanExpand();
    window.addEventListener("resize", updateCanExpand);

    return (): void => {
      window.removeEventListener("resize", updateCanExpand);
    };
  }, [props.lines, props.text, updateCanExpand]);

  const collapsedStyles: CSSProperties | undefined = isExpanded
    ? undefined
    : {
        display: "-webkit-box",
        overflow: "hidden",
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: props.lines,
      };

  return (
    <div {...(props.dataTestId ? { "data-testid": props.dataTestId } : {})}>
      <p
        id={contentId}
        ref={contentRef}
        className="lines-ellipsis"
        style={collapsedStyles}
        aria-hidden={!isExpanded}
      >
        {props.text}
      </p>
      {canExpand && (
        <button
          type="button"
          className="usa-button usa-button--unstyled"
          aria-controls={contentId}
          aria-expanded={isExpanded}
          onClick={(): void => setIsExpanded((expanded) => !expanded)}
        >
          {isExpanded ? props.viewLessText : props.viewMoreText}
        </button>
      )}
    </div>
  );
};
