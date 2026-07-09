import { AboutUsSection } from "@/components/impactReport/sections/AboutUsSection";
import { AwarenessAndComplianceSection } from "@/components/impactReport/sections/AwarenessAndComplianceSection";
import { CustomerServiceExperienceSection } from "@/components/impactReport/sections/CustomerServiceExperienceSection";
import { DrivingEquitySection } from "@/components/impactReport/sections/DrivingEquitySection";
import { FosteringEconomicGrowthSection } from "@/components/impactReport/sections/FosteringEconomicGrowthSection";
import { MakingItEasierSection } from "@/components/impactReport/sections/MakingItEasierSection";
import { LocalizedLink } from "@/components/landing/LocalizedLink";
import type { AppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";

interface Props {
  readonly locale: AppLocale;
}

export const ImpactReportPage = ({ locale }: Props) => {
  const { impactReport } = getApplicationMessages({ locale });

  return (
    <>
      <div className="bg-primary-lightest impact-report-header">
        <div className="grid-container">
          <h1 className="text-primary-darkest">{impactReport.title}</h1>
          <p>{impactReport.subtitle}</p>
          <LocalizedLink
            className="usa-button usa-button--outline bg-white"
            link={impactReport.downloadLink}
          />
        </div>
      </div>
      <div className="grid-container usa-section padding-top-1">
        <article>
          <AboutUsSection content={impactReport.aboutUs} />
          <hr className="border-base-light border-top-1px margin-y-5" />
          <MakingItEasierSection content={impactReport.makingItEasier} />
          <hr className="border-base-light border-top-1px margin-y-5" />
          <AwarenessAndComplianceSection content={impactReport.awarenessAndCompliance} />
          <hr className="border-base-light border-top-1px margin-y-5" />
          <FosteringEconomicGrowthSection content={impactReport.fosteringEconomicGrowth} />
          <hr className="border-base-light border-top-1px margin-y-5" />
          <CustomerServiceExperienceSection content={impactReport.customerServiceExperience} />
          <hr className="border-base-light border-top-1px margin-y-5" />
          <DrivingEquitySection content={impactReport.drivingEquity} />
        </article>
      </div>
    </>
  );
};
