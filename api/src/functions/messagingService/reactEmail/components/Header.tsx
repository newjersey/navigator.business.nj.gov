import { Column, Link, Markdown, Row, Section } from "@react-email/components";

export const Header = (props: { utmString?: string }): JSX.Element => {
  return (
    <Section style={{ fontSize: "12px" }}>
      <Row style={{ backgroundColor: "#1B1B1B", color: "#FFFFFF", padding: "12px 20px" }}>
        <Column>Official Site of the State of New Jersey</Column>{" "}
        <Column style={{ textAlign: "right" }}>
          <Link
            href={`https://account.business.nj.gov/${props.utmString}`}
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            account.business.nj.gov
          </Link>
        </Column>
      </Row>
      <Row style={{ backgroundColor: "#F8F8F8", padding: "0 20px" }}>
        <Column>
          <Markdown markdownCustomStyles={{ link: { color: "black" } }}>
            **For Your Safety.** We will never send or ask for your personal or business information
            by email. If you suspect a scam, report it at
            [cyber.nj.gov/report](https://cyber.nj.gov/report)
          </Markdown>
        </Column>
      </Row>
    </Section>
  );
};
