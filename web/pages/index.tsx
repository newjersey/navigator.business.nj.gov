import { Layout } from "../components/Layout";
import Link from "next/link";
import React, { ReactElement, useContext } from "react";
import { Hero } from "../components/njwds/Hero";
import { PageSkeleton } from "../components/PageSkeleton";
import { AuthContext } from "./_app";
import { AuthButton } from "../components/AuthButton";

const Home = (): ReactElement => {
  const { state } = useContext(AuthContext);

  return (
    <PageSkeleton>
      <Hero
        calloutText="Welcome to the new"
        subCalloutText="Business.NJ.gov"
        supportingText="Your first stop for doing business in the state"
        callToActionText="Try the Startup Guide"
        onClick={() => {}}
      />
      <Layout home>
        <h1>the next api basurl says: {process.env.API_BASE_URL}</h1>

        <h1>
          {state.isAuthenticated ? `Welcome, ${state.user.name || state.user.email}` : "Welcome to EasyRegNJ"}
        </h1>
        <p>The simplest way to license, form & register your business in the State of New Jersey.</p>
        <p>
          This tool is for prospective business owners who are ready to officially form and register their
          business with state and local officials.
        </p>
        <p>
          If you are still in the ideation phase, please visit our Guidance page on how to plan a new
          business.
        </p>
        <p>To start, you’ll need to create an account.</p>
        <p>Creating an account helps you easily track the progress of your business.</p>
        {state.isAuthenticated && (
          <Link href="/onboarding">
            <button className="usa-button">Get Started</button>
          </Link>
        )}
        <AuthButton />
      </Layout>
    </PageSkeleton>
  );
};

export default Home;
