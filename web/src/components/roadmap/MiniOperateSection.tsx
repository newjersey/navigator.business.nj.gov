import React, { ReactElement } from "react";
import Link from "next/link";
import { FilingReference, SectionType } from "@/lib/types/types";
import { SectionAccordion } from "./SectionAccordion";
import { useRouter } from "next/router";

interface Props {
  filingsReferences: Record<string, FilingReference>;
  onClose?: () => void;
}

export const MiniOperateSection = ({ filingsReferences, onClose }: Props): ReactElement => {
  const router = useRouter();
  const featureDisableOperate = process.env.FEATURE_DISABLE_OPERATE ?? false;
  if (featureDisableOperate) return <></>;

  return (
    <SectionAccordion sectionType={"OPERATE" as SectionType} mini={true}>
      {Object.keys(filingsReferences).map((filing) => (
        <div key={filingsReferences[filing].name}>
          <Link href={`/filings/${filingsReferences[filing].urlSlug}`} passHref>
            <button
              data-testid={filingsReferences[filing].name}
              className={`operate-bullet usa-button--unstyled width-100 padding-1 cursor-pointer hover:bg-base-lightest line-height-body-2 font-body-3xs text-ink ${
                router.query.filingUrlSlug === filingsReferences[filing].urlSlug
                  ? "bg-base-lightest bg-chevron text-primary-dark text-bold active"
                  : ""
              }`}
              {...(onClose ? { onClick: onClose } : {})}
            >
              {filingsReferences[filing].name}
            </button>
          </Link>
        </div>
      ))}
    </SectionAccordion>
  );
};
