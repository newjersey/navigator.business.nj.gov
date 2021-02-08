import Head from "next/head";
import { Layout, siteTitle } from "../components/Layout";
import utilStyles from "../styles/utils.module.scss";
import Link from "next/link";
import { GetStaticProps, GetStaticPropsResult } from "next";
import { Date } from "../components/date";
import { ReactElement } from "react";
import { PostOverview } from "../lib/types";
import { getSortedPosts } from "../lib/posts";
import { Hero } from "../components/njwds/Hero";
import { PageSkeleton } from "../components/PageSkeleton";

interface Props {
  allPosts: PostOverview[];
}

const Home = ({ allPosts }: Props): ReactElement => {
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
        <Head>
          <title>{siteTitle}</title>
        </Head>
        <button
          className="usa-button"
          onClick={() => {
            console.log("clicked");
          }}
        >
          Default
        </button>
        <section className={utilStyles.headingMd}>
          <p>[Your Self Introduction]</p>
          <p>
            (This is a sample website - you’ll be building a site like this in{" "}
            <a href="https://nextjs.org/learn">our Next.js tutorial</a>.)
          </p>
        </section>
        <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
          <h2 className={utilStyles.headingLg}>Blog</h2>
          <ul className={utilStyles.list}>
            {allPosts.map(({ id, date, title }) => (
              <li className={utilStyles.listItem} key={id}>
                <Link href={`/posts/${id}`} passHref>
                  <a href={`/posts/${id}`}>{title}</a>
                </Link>
                <br />
                <small className={utilStyles.lightText}>
                  <Date dateString={date} />
                </small>
              </li>
            ))}
          </ul>
        </section>
      </Layout>
    </PageSkeleton>
  );
};

export const getStaticProps: GetStaticProps = async (): Promise<
  GetStaticPropsResult<Props>
> => {
  const allPosts = getSortedPosts();
  return {
    props: {
      allPosts,
    },
  };
};

export default Home;
