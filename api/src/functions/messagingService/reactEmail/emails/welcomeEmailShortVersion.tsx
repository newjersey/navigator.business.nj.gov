import {
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Markdown,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { Header } from "../components/Header";

export const WelcomeEmailShortVersion = (): JSX.Element => {
  return (
    <Html lang="en">
      <Head>
        <title>Welcome to Business.NJ.gov</title>
      </Head>
      <Container style={{ fontFamily: "sans-serif" }}>
        <Header utmString="?utm_source=myaccount-welcome-email&utm_medium=email&utm_campaign=welcome-email&utm_content=welcome-email-B-version1-black-ribbon-header" />

        {/* Body section */}
        <Section style={{ padding: "0 24px" }}>
          {/* Logo */}
          <Section style={{ padding: "32px 0 24px" }}>
            <Row>
              <Img
                src="https://files.business.nj.gov/biznj-logo.png"
                alt="Business.NJ.gov My Account"
                width="240"
              />
            </Row>
          </Section>

          <Row>
            <h1>Doing business in New Jersey just got easier...</h1>
          </Row>
          <Hr />
          <Row>
            <Markdown markdownCustomStyles={{ link: { color: "black" } }}>
              Congratulations on creating your account with
              **[Business.NJ.gov](https://business.nj.gov/?utm_source=myaccount-welcome-email&utm_medium=email&utm_campaign=welcome-email&utm_content=welcome-email-B-version1-inline-message-business.nj.gov)**.
            </Markdown>
            <Markdown markdownContainerStyles={{ paddingBottom: "18px" }}>
              You've joined **200,000+ business owners** who've used the site to start, operate, and
              grow their businesses.
            </Markdown>
          </Row>

          {/* Call to action section */}
          <Section
            style={{
              backgroundColor: "#F9FBFB",
              borderRadius: "20px",
              textAlign: "center",
              padding: "0 0 24px",
            }}
          >
            <Row>
              <h2
                style={{
                  margin: "32px 0px 16px 0",
                  fontSize: "20px",
                  fontWeight: 700,
                  lineHeight: "120%",
                  color: "#1b1b1b",
                }}
              >
                Log In to Get Started
              </h2>
              <Button
                href="https://account.business.nj.gov/login?utm_source=myaccount-welcome-email&utm_medium=email&utm_campaign=welcome-email&utm_content=welcome-email-B-version1-green-cta"
                style={{
                  background: "#4b7600",
                  color: "#fff",
                  padding: "12px 24px",
                  borderRadius: "10px",
                }}
              >
                Open Dashboard
              </Button>
            </Row>
            <Row>
              <Text>
                <Link
                  href="https://account.business.nj.gov/login"
                  style={{ textDecoration: "underline", color: "#3D4551" }}
                >
                  https://account.business.nj.gov/login
                </Link>
              </Text>
            </Row>
          </Section>

          <Hr style={{ margin: "40px 0", maxWidth: "100%" }} />

          {/* Footer */}
          <Section style={{ color: "#A9AEB1", fontSize: "10px" }}>
            <Row style={{ padding: "0 0 24px" }}>
              You're receiving this message because you created an account with Business.NJ.gov.
              <br />
              <br />
              Replies to this email will go to a Business.NJ.gov support representative via live
              chat.
            </Row>
            <Row style={{ padding: "0 0 24px" }}>
              {/* Links */}
              <Link
                style={{ color: "inherit", textDecoration: "underline" }}
                href="https://business.nj.gov/privacy-policy?utm_source=myaccount-welcome-email&utm_medium=email&utm_campaign=welcome-email&utm_content=welcome-email-B-version1-footer-privacy-policy"
              >
                Privacy Policy
              </Link>{" "}
              <span style={{ padding: " 0 8px" }}>|</span>
              <Link
                style={{ color: "inherit", textDecoration: "underline" }}
                href="https://business.nj.gov/contact-us?utm_source=myaccount-welcome-email&utm_medium=email&utm_campaign=welcome-email&utm_content=welcome-email-B-version1-footer-contact-us"
              >
                Contact Us
              </Link>{" "}
              <span style={{ padding: " 0 8px" }}>|</span>
              <Link
                style={{ color: "inherit", textDecoration: "underline" }}
                href="https://account.business.nj.gov/profile?utm_source=myaccount-welcome-email&utm_medium=email&utm_campaign=welcome-email&utm_content=welcome-email-B-version1-footer-manage-notifications"
              >
                Manage Notifications
              </Link>
            </Row>

            {/* Logo */}
            <Row style={{ padding: "0 0 24px" }}>
              <Img
                src="https://files.business.nj.gov/biznj-logo.png"
                alt="Business.NJ.gov My Account"
                width="240"
              />
            </Row>
            <Row style={{ padding: "0 0 24px" }}>
              The State of New Jersey
              <br />
              PO Box 001
              <br />
              Trenton, NJ 08625
            </Row>
            <Row style={{ padding: "0 0 24px" }}>
              Follow us on social media:
              <Link href="https://www.facebook.com/BusinessNJgov">
                <Img src="https://files.business.nj.gov/facebook.png" width="32" height="32" />
              </Link>
            </Row>
          </Section>
        </Section>
      </Container>
    </Html>
  );
};

export default WelcomeEmailShortVersion;
