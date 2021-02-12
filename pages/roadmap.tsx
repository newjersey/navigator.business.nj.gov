/* eslint-disable @typescript-eslint/no-explicit-any */

import { ReactElement, useContext } from "react";
import { PageSkeleton } from "../components/PageSkeleton";
import { Layout } from "../components/Layout";
import Link from "next/link";
import { FormContext } from "./_app";

const Roadmap = (): ReactElement => {
  const { formData } = useContext(FormContext);

  const getHeader = (): string => {
    return formData.businessName?.businessName
      ? `Business Roadmap for ${formData.businessName?.businessName}`
      : "Your Business Roadmap";
  };

  const needsAlcoholLicense = (): boolean => {
    if (!formData.locations?.locations) {
      return false;
    }

    return formData.locations.locations.some((it) => it.license);
  };

  return (
    <PageSkeleton>
      <Layout>
        <h1>{getHeader()}</h1>
        <p>
          To start a Restaurant in New Jersey, you’ll need to complete the basic
          steps below.
        </p>

        <h2>Local: Permits & Licenses</h2>
        <ul>
          <li>Select a Location(s) (1-2 months)</li>
          <li>
            Contact your Local Health Department to Complete Permitting
            Requirements (varies)
          </li>
          <li>Obtain Construction Permits (1-2 weeks)</li>
          <li>Complete Food Safety Training (1 week)</li>
          {needsAlcoholLicense() && <li>Obtain a Liquor License (varies)</li>}
        </ul>

        <h2>State: Formation & Registration</h2>
        <ul>
          <li>
            Register for an Employer Identification Number (EIN) (10 minutes)
          </li>
          <li>Complete Business Formation (40 minutes)</li>
          <li>Develop an Alternate Name (tbd)</li>
        </ul>
        <Link href="/onboarding">
          <button className="usa-button">Edit my data</button>
        </Link>
      </Layout>
    </PageSkeleton>
  );
};

export default Roadmap;
