import { OperateReference, SectionType } from "@/lib/types/types";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactElement } from "react";
import { SectionAccordion } from "./SectionAccordion";

interface Props {
  operateReferences: Record<string, OperateReference>;
  onClose?: () => void;
}

export const MiniOperateSection = ({ operateReferences, onClose }: Props): ReactElement => {
  const router = useRouter();

  return (
    <SectionAccordion sectionType={"OPERATE" as SectionType} mini={true}>
      {Object.keys(operateReferences).map((ref) => (
        <div key={operateReferences[ref].name}>
          <Link href={operateReferences[ref].urlPath} passHref>
            <button
              data-testid={operateReferences[ref].name}
              className={`usa-button--unstyled width-100 padding-1 cursor-pointer hover:bg-base-lightest line-height-body-2 font-body-3xs text-ink ${
                router.query.filingUrlSlug === operateReferences[ref].urlPath
                  ? "bg-base-lightest bg-chevron text-primary-dark text-bold active"
                  : ""
              }`}
              {...(onClose ? { onClick: onClose } : {})}
            >
              {operateReferences[ref].name}
            </button>
          </Link>
        </div>
      ))}
    </SectionAccordion>
  );
};
