import { withDesign } from "storybook-addon-designs";

export default {
  title: "WIP/Colors",
  decorators: [withDesign],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=1933%3A2730",
    },
  },
};

const renderColor = (variable: string, hexcode: string) => (
  <div className="">
    <div
      className={`margin-bottom-2 height-10 width-15 bg-${variable} text-base-darkest text-bold margin-right-6`}
    ></div>
    <div className="text-wrap">{variable}</div>
    <div>{hexcode}</div>
  </div>
);

const neutralBase = (
  <div className="flex flex-row">
    <div className="h1-styling margin-right-4 width-card-lg">Neutral/Base</div>
    {renderColor("base-extra-light", "#F8F8F8")}
    {renderColor("base-lightest", "#F0F0F0")}
    {renderColor("base-lighter", "#E6E6E6")}
    {renderColor("base-light", "#ADADAD")}
    {renderColor("base", "#757575")}
    {renderColor("base-dark", "#5C5C5C")}
    {renderColor("base-darkest", "#1B1B1B")}
  </div>
);

const coolNeutral = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Cool Neutral</div>
    {renderColor("cool-extra-light", "#F9FBFB")}
    {renderColor("cool-lighter", "#DDEDED")}
  </div>
);

const primary = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Primary</div>
    {renderColor("primary-extra-light", "#F2F7EB")}
    {renderColor("primary-lighter", "#C5EE93")}
    {renderColor("primary-light", "#7FB135")}
    {renderColor("primary-vivid", "#6A7D00")}
    {renderColor("primary", "#4B7600")}
    {renderColor("primary-dark", "#466C04")}
    {renderColor("primary-darker", "#243413")}
  </div>
);

const secondary = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Secondary</div>
    {renderColor("secondary-lighter", "#CFE8FF")}
    {renderColor("secondary-light", "#73B3E7")}
    {renderColor("secondary-vivid", "#0076D6")}
    {renderColor("secondary", "#2378C3")}
    {renderColor("secondary-dark", "#0050D8")}
    {renderColor("secondary-darker", "#162E51")}
  </div>
);

const accentCool = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Accent Cool</div>
    {renderColor("accent-cool-lightest", "#ECF4FB")}
    {renderColor("accent-cool-lighter", "#D9E8F6")}
    {renderColor("accent-cool-light", "#AACDEC")}
    {renderColor("accent-cool", "#73B3E7")}
    {renderColor("accent-cool-dark", "#4F97D1")}
    {renderColor("accent-cool-darker", "#2C608A")}
    {renderColor("accent-cool-darkest", "#38536F")}
    {renderColor("accent-cool-more-dark", "#2E4153")}
  </div>
);

const accentWarm = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Accent Warm</div>
    {renderColor("accent-warm-lighter", "#FFE396")}
    {renderColor("accent-warm-light", "#E5A000")}
    {renderColor("accent-warm", "#936F38")}
    {renderColor("accent-warm-dark", "#7A591A")}
    {renderColor("accent-warm-darker", "#5C410A")}
  </div>
);

const accentCooler = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Accent Cooler</div>
    {renderColor("accent-cooler-lightest", "#ECE6F2")}
    {renderColor("accent-cooler-light", "#C1ADD3")}
    {renderColor("accent-cooler", "#835DA4")}
    {renderColor("accent-cooler-dark", "#5C3F74")}
    {renderColor("accent-cooler-darker", "#4F97D1")}
  </div>
);

const success = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Success</div>
    {renderColor("success-lighter", "#ECF3EC")}
    {renderColor("success-light", "#70E17B")}
    {renderColor("success", "#00A91C")}
    {renderColor("success-dark", "#4D8055")}
    {renderColor("success-darker", "#446443")}
  </div>
);

const info = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Info</div>
    {renderColor("info-extra-light", "#E7F6F8")}
    {renderColor("info-light", "#99DEEA")}
    {renderColor("info", "#00BDE3")}
    {renderColor("info-dark", "#009EC1")}
    {renderColor("info-darker", "#2E6276")}
    {renderColor("info-darkest", "#134C57")}
  </div>
);

const warning = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Warning</div>
    {renderColor("warning-extra-light", "#FAF3D1")}
    {renderColor("warning-light", "#FEE685")}
    {renderColor("warning", "#FFBE2E")}
    {renderColor("warning-dark", "#E5A000")}
    {renderColor("warning-darker", "#936F38")}
  </div>
);

const error = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Error</div>
    {renderColor("error-extra-light", "#F4E3DB")}
    {renderColor("error-light", "#F39268")}
    {renderColor("error", "#D54309")}
    {renderColor("error-dark", "#B51D09")}
    {renderColor("error-darker", "#6F3331")}
  </div>
);

const shades = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Shades</div>
    {renderColor("white", "#FFFFFF")}
    {renderColor("disabled", "#757575")}
  </div>
);

const Template = ({}) => (
  <div>
    <div className="h1-styling-large margin-y-4">Theme Palette</div>
    <div>{neutralBase}</div>
    <div>{coolNeutral}</div>
    <div>{primary}</div>
    <div>{secondary}</div>
    <div>{accentCool}</div>
    <div>{accentWarm}</div>
    <div>{accentCooler}</div>
    <div className="h1-styling-large margin-bottom-4 margin-top-10">State Palette</div>
    <div>{success}</div>
    <div>{info}</div>
    <div>{warning}</div>
    <div>{error}</div>
    <div>{shades}</div>
  </div>
);

export const Colors = Template.bind({});
