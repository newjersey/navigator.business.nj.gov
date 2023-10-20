import { ComponentPropsWithoutRef, ReactElement } from "react";

export const TaskFooter = (props: ComponentPropsWithoutRef<"div">): ReactElement => {
  const { children, ...attributes } = props;
  return (
    <div
      className="flex flex-justify-end bg-base-lightest margin-top-4 margin-x-neg-4 padding-3 margin-bottom-neg-4 flex-column mobile-lg:flex-row radius-bottom-lg"
      {...attributes}
    >
      <div className="mobile-lg:margin-bottom-0 margin-bottom-1">{children}</div>
    </div>
  );
};
