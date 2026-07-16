import { GovDeliverySignupForm } from "@/components/newsletterSignup/GovDeliverySignupForm";
import type { AppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";

interface Props {
  readonly locale: AppLocale;
}

/**
 * Renders the newsletter signup page: a heading and the GovDelivery signup form.
 *
 * @param props.locale Locale used to resolve the heading copy.
 * @returns The newsletter signup page content.
 */
export const NewsletterSignupPage = ({ locale }: Props) => {
  const { newsletterSignup } = getApplicationMessages({ locale });

  return (
    <div className="grid-container usa-section">
      <h1>{newsletterSignup.title}</h1>
      <div className="usa-card__container">
        <div className="usa-card__body">
          <GovDeliverySignupForm />
        </div>
      </div>
    </div>
  );
};
