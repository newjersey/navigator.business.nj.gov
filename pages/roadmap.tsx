/* eslint-disable @typescript-eslint/no-explicit-any */

import { ReactElement, useState } from "react";
import { PageSkeleton } from "../components/PageSkeleton";
import { Layout } from "../components/Layout";
import { useMountEffect } from "../lib/helpers";
import Link from "next/link";

const Roadmap = (): ReactElement => {
  const [formData, setFormData] = useState<any>({});

  useMountEffect(() => {
    setFormData(JSON.parse(window.localStorage.getItem("formData")));
  });

  const getBusinessName = (): string => {
    return formData.businessName?.businessName || "";
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
        <h1>{`Business Roadmap for ${getBusinessName()}`}</h1>
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
          {needsAlcoholLicense() && <li>Obtain a Liquor License (varies) </li>}
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
