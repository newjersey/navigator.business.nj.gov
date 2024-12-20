import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { Meta, StoryObj } from "@storybook/react";
import { ReactElement } from "react";

const Template = () => {
  const renderFiveColumns = (section: {
    title?: ReactElement<any>;
    usaProseElement?: ReactElement<any>;
    usaProseCSS: ReactElement<any>;
    element?: ReactElement<any>;
    cSS: ReactElement<any>;
  }) => {
    return (
      <div className="grid-container width-tablet-lg">
        <div className={`grid-row padding-1`}>
          <div className="grid-col-2 margin-right-5">{section.title && section.title}</div>
          <div className="grid-col-2 margin-right-3">
            {section.usaProseElement && renderWithUSAProse(section.usaProseElement)}
          </div>
          <div className="grid-col-2 margin-right-3">{renderWithUSAProse(section.usaProseCSS)}</div>
          <div className="grid-col-2 margin-right-3">{section.element && renderElement(section.element)}</div>
          <div className="grid-col-2">{renderElement(section.cSS)}</div>
        </div>
      </div>
    );
  };

  const renderTwoColumn = (section: { title: string; markDown: string }) => {
    return (
      <div className="grid-container width-tablet-lg">
        <div className={`grid-row padding-1`}>
          <div className="grid-col-2 margin-right-3">{section.title}</div>
          <div className="grid-col-auto">
            <Content>{section.markDown}</Content>
          </div>
        </div>
      </div>
    );
  };

  const renderWithUSAProse = (children: ReactElement<any>) => {
    return <div className="usa-prose display-inline-block">{children}</div>;
  };

  const renderElement = (children: ReactElement<any>) => {
    return <div className="display-inline-block">{children}</div>;
  };

  const title = {
    title: undefined,
    usaProseElement: <div>USA Prose Element</div>,
    usaProseCSS: <div>USA Prose Styling Only</div>,
    element: <div>Element</div>,
    cSS: <div>Styling Only</div>,
    noBorder: true,
  };

  const h1Large = {
    title: <div>H1 Large (Styling)</div>,
    usaProseElement: undefined,
    usaProseCSS: <div className="h1-styling-large">Hello</div>,
    element: undefined,
    cSS: <div className="h1-styling-large">Hello</div>,
  };

  const h1 = {
    title: <div>H1</div>,
    usaProseElement: <h1>Hello</h1>,
    usaProseCSS: <div className="h1-styling">Hello</div>,
    element: <h1>Hello</h1>,
    cSS: <div className="h1-styling">Hello</div>,
  };

  const h2 = {
    title: <div>H2</div>,
    usaProseElement: <Heading level={2}>Hello</Heading>,
    usaProseCSS: <div className="h2-styling">Hello</div>,
    element: <Heading level={2}>Hello</Heading>,
    cSS: <div className="h2-styling">Hello</div>,
  };

  const h2Unbolded = {
    title: <div>H2 Unbolded</div>,
    usaProseElement: (
      <Heading level={2} className="font-weight-normal">
        Hello
      </Heading>
    ),
    usaProseCSS: <div className="h2-styling font-weight-normal">Hello</div>,
    element: (
      <Heading level={2} className="font-weight-normal">
        Hello
      </Heading>
    ),
    cSS: <div className="h2-styling font-weight-normal">Hello</div>,
  };

  const h3 = {
    title: <div>H3</div>,
    usaProseElement: <Heading level={3}>Hello</Heading>,
    usaProseCSS: <div className="h3-styling">Hello</div>,
    element: <Heading level={3}>Hello</Heading>,
    cSS: <div className="h3-styling">Hello</div>,
  };

  const h4 = {
    title: <div>H4</div>,
    usaProseElement: <Heading level={4}>Hello</Heading>,
    usaProseCSS: <div className="h4-styling">Hello</div>,
    element: <Heading level={4}>Hello</Heading>,
    cSS: <div className="h4-styling">Hello</div>,
  };

  const h5 = {
    title: <div>H5</div>,
    usaProseElement: <h5>Hello</h5>,
    usaProseCSS: <div className="h5-styling">Hello</div>,
    element: <h5>Hello</h5>,
    cSS: <div className="h5-styling">Hello</div>,
  };

  const h6 = {
    title: <div>H6</div>,
    usaProseElement: <h6>Hello</h6>,
    usaProseCSS: <div className="h6-styling">Hello</div>,
    element: <h6>Hello</h6>,
    cSS: <div className="h6-styling">Hello</div>,
  };

  const bodyText = {
    title: "Standard",
    markDown: "This is body text",
  };

  const bodyTextWithBold = {
    title: "Bolded",
    markDown: "This is **body text with bold** styling",
  };

  const bodyTextWithLink = {
    title: "External Link",
    markDown: "This is [body text](#) with a link",
  };

  const requiredBodyTextWithLink = {
    title: "Required Link",
    markDown: "This is **[required body text](#)** with a link",
  };

  const bodyTextWithContextualLink = {
    title: "Contextual Link",
    markDown: "This is `body text|body-text` with a contextual link",
  };

  const h3TextWithContextualLink = {
    title: "H Element Contextual Link",
    markDown: "### This is `heading text|body-text` with a contextual link",
  };

  const h3TextWithLink = {
    title: "H Element External Link",
    markDown: "### This is [heading text](#) with a link",
  };

  const h3TextWithBoldedContextualLink = {
    title: "H Element Contextual Link",
    markDown: "### **This is `heading text|body-text` with a bolded contextual link**",
  };

  const h3TextWithBoldedLink = {
    title: "H Element External Link",
    markDown: "### **This is [heading text](#) with a bolded link**",
  };

  const multiLineText = {
    title: "Multi-line",
    markDown:
      "Sibling of Header, paragraph element - Sed ut perspiciatis unde omnis iste natus error" +
      " sit voluptatem. accusantium **doloremque laudantium**, totam rem aperiam, eaque \n\n dicta" +
      " sunt explicabo. quae ab illo **inventore veritatis et** quasi architecto beatae vitae quia voluptas sit aspernatur aut odit aut fugit," +
      "sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. " +
      "Neque porr. \n\n uisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit",
  };

  return (
    <div>
      <h1>Headings</h1>
      <div>{renderFiveColumns(title)}</div>
      <div>{renderFiveColumns(h1Large)}</div>
      <div>{renderFiveColumns(h1)}</div>
      <div>{renderFiveColumns(h2)}</div>
      <div>{renderFiveColumns(h2Unbolded)}</div>
      <div>{renderFiveColumns(h3)}</div>
      <div>{renderFiveColumns(h4)}</div>
      <div>{renderFiveColumns(h5)}</div>
      <div>{renderFiveColumns(h6)}</div>
      <hr />
      <div className="grid-container width-tablet-lg">
        <div className={`grid-row padding-1`}>
          <div className="grid-col-2 margin-right-3">H Element Text Normal</div>
          <div className="grid-col-auto">
            <Heading level={3} className={"font-weight-normal"}>
              This is heading text with normal font weight
            </Heading>
          </div>
        </div>
      </div>
      <div>{renderTwoColumn(h3TextWithContextualLink)}</div>
      <div>{renderTwoColumn(h3TextWithBoldedContextualLink)}</div>
      <div>{renderTwoColumn(h3TextWithLink)}</div>
      <div>{renderTwoColumn(h3TextWithBoldedLink)}</div>

      <hr />
      <h1> Body Text</h1>
      <div>{renderTwoColumn(bodyText)}</div>
      <div>{renderTwoColumn(bodyTextWithBold)}</div>
      <div>{renderTwoColumn(bodyTextWithLink)}</div>
      <div>{renderTwoColumn(requiredBodyTextWithLink)}</div>
      <div>{renderTwoColumn(bodyTextWithContextualLink)}</div>
      <div className="grid-container width-tablet-lg">
        <div className={`grid-row padding-1`}>
          <div className="grid-col-2 margin-right-3">{multiLineText.title}</div>
          <div className="grid-col-9">
            <Content>{multiLineText.markDown}</Content>
          </div>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof Template> = {
  title: "Atoms/Typography",
  component: Template,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2750%3A23886&t=hKereiEXH3bZmcGN-1",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Template>;

export const Typography: Story = {};
