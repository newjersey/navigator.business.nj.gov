import { ReactElement } from "react";
import { PageSkeleton } from "../components/PageSkeleton";
import { Layout } from "../components/Layout";

const Roadmap = (): ReactElement => {
  return (
    <PageSkeleton>
      <Layout>
        <h1>Your Business Roadmap</h1>
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
        </ul>

        <h2>State: Formation & Registration</h2>
        <ul>
          <li>
            Register for an Employer Identification Number (EIN) (10 minutes)
          </li>
          <li>Complete Business Formation (40 minutes)</li>
          <li>Develop an Alternate Name (tbd)</li>
        </ul>
      </Layout>
    </PageSkeleton>
  );
};

export default Roadmap;
