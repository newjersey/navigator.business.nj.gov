import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

export const OpenAccount = (): ReactElement => {
  const { Config } = useConfig();
  const h3Override = ({ children }: { children: string[] }): ReactElement => (
    <h3 className="text-accent-cool-darker">{children}</h3>
  );

  return (
    <>
      <h2 className="text-secondary-darker">{Config.learnPageOpenAccount.heading}</h2>
      <Content overrides={{ h3: h3Override }}>{Config.learnPageOpenAccount.content}</Content>
      <section className="open-account-testimonial margin-top-6">
        <h2 className="text-secondary-darker">{Config.learnPageOpenAccount.testimonialHeading}</h2>
        <figure className="open-account-testimonial__content">
          <img
            className="open-account-testimonial__image"
            src="/img/testimonial-chris-strangebreu.png"
            alt=""
          />
          <blockquote className="open-account-testimonial__quote">
            <p>“{Config.learnPageOpenAccount.testimonialQuote}”</p>
            <footer>— {Config.learnPageOpenAccount.testimonialAttribution}</footer>
          </blockquote>
        </figure>
      </section>
    </>
  );
};
