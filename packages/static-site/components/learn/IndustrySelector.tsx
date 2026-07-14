"use client";

import { ComboBox } from "@trussworks/react-uswds";
import { useState } from "react";

interface IndustryOption {
  readonly id: string;
  readonly name: string;
}

interface Props {
  readonly industries: readonly IndustryOption[];
  readonly baseUrl: string;
  readonly heading: string;
  readonly ctaText: string;
}

const buildOnboardingHref = (baseUrl: string, industryId: string): string => {
  const url = new URL(baseUrl);
  url.searchParams.set("industry", industryId);
  return url.toString();
};

export const IndustrySelector = ({ industries, baseUrl, heading, ctaText }: Props) => {
  const [selectedIndustryId, setSelectedIndustryId] = useState<string | undefined>(undefined);

  const href = selectedIndustryId ? buildOnboardingHref(baseUrl, selectedIndustryId) : undefined;

  const options = industries.map((industry) => ({
    value: industry.id,
    label: industry.name,
  }));

  return (
    <div className="border-1px border-base-light radius-md padding-3 margin-top-3">
      <label className="usa-label font-heading-lg text-bold" htmlFor="industry-select">
        {heading}
      </label>
      <div className="grid-row grid-gap flex-align-end">
        <div className="grid-col-8">
          <ComboBox
            id="industry-select"
            name="industry"
            options={options}
            onChange={(val) => setSelectedIndustryId(val)}
          />
        </div>
        <div className="grid-col-4">
          <a
            href={href}
            className={`usa-button width-full${!selectedIndustryId ? " usa-button--disabled" : ""}`}
            aria-disabled={!selectedIndustryId}
            rel="noreferrer"
            target="_blank"
            style={{ height: "2.5rem" }}
          >
            {ctaText}
          </a>
        </div>
      </div>
    </div>
  );
};
