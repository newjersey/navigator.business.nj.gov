import { withDesign } from "storybook-addon-designs";

export default {
  title: "Atoms/Colors",
  decorators: [withDesign],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=1933%3A2730",
    },
  },
};

const renderColor = (variable: string, hexcode: string) => (
  <div className="margin-right-1">
    <div
      className={`margin-bottom-2 height-10 width-15 bg-${variable} text-base-darkest text-bold margin-right-6 ${
        variable === "white" ? "border" : ""
      }`}
    />
    <div className="text-wrap">{variable}</div>
    <span className={`border border-${variable} margin-right-1 padding-x-1`}> </span>
    <span className={`text-${variable}`}>Text</span>
    <div className="text-uppercase">{hexcode}</div>
  </div>
);

const neutralBase = (
  <div className="flex flex-row">
    <div className="h1-styling margin-right-4 width-card-lg">Neutral/Base</div>
    {renderColor("base-extra-light", "#f8f8f8")}
    {renderColor("base-lightest", "#f0f0f0")}
    {renderColor("base-lighter", "#e6e6e6")}
    {renderColor("base-light", "#adadad")}
    {renderColor("base", "#757575")}
    {renderColor("base-dark", "#5c5c5c")}
    {renderColor("base-darkest", "#1b1b1b")}
  </div>
);

const primary = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Primary</div>
    {renderColor("primary-extra-light", "#f2f7eb")}
    {renderColor("primary-lightest", "#d9e9bf")}
    {renderColor("primary-lighter", "#c5ee93")}
    {renderColor("primary-more-light", "#bfd89a")}
    {renderColor("primary-light", "#7fb135")}
    {renderColor("primary-light-vivid", "#81bd00")}
    {renderColor("primary-vivid", "#6a7d00")}
    {renderColor("primary", "#4b7600")}
    {renderColor("primary-dark", "#466c04")}
    {renderColor("primary-darker", "#243413")}
  </div>
);

const secondary = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Secondary</div>
    {renderColor("secondary-lighter", "#cfe8ff")}
    {renderColor("secondary-light", "#73b3e7")}
    {renderColor("secondary-vivid", "#0076d6")}
    {renderColor("secondary", "#2378c3")}
    {renderColor("secondary-dark", "#0050d8")}
    {renderColor("secondary-darker", "#162e51")}
  </div>
);

const accentCool = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Accent Cool</div>
    {renderColor("accent-cool-lightest", "#ecf4fb")}
    {renderColor("accent-cool-lighter", "#d9e8f6")}
    {renderColor("accent-cool-light", "#aacdec")}
    {renderColor("accent-cool", "#73b3e7")}
    {renderColor("accent-cool-dark", "#4f97d1")}
    {renderColor("accent-cool-darker", "#2c608a")}
    {renderColor("accent-cool-darkest", "#38536f")}
    {renderColor("accent-cool-more-dark", "#2e4153")}
  </div>
);

const accentWarm = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Accent Warm</div>
    {renderColor("accent-warm-extra-light", "#fff4dc")}
    {renderColor("accent-warm-lighter", "#ffe396")}
    {renderColor("accent-warm-light", "#e5a000")}
    {renderColor("accent-warm", "#936f38")}
    {renderColor("accent-warm-dark", "#7a591a")}
    {renderColor("accent-warm-darker", "#5c410a")}
  </div>
);

const success = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Success</div>
    {renderColor("success-extra-light", "#ecf3ec")}
    {renderColor("success-lighter", "#c9e8c9")}
    {renderColor("success-light", "#70e17b")}
    {renderColor("success", "#00a91c")}
    {renderColor("success-dark", "#4d8055")}
    {renderColor("success-darker", "#446443")}
  </div>
);

const info = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Info</div>
    {renderColor("info-extra-light", "#e7f6f8")}
    {renderColor("info-light", "#99deea")}
    {renderColor("info", "#00bde3")}
    {renderColor("info-dark", "#009ec1")}
    {renderColor("info-darker", "#2e6276")}
    {renderColor("info-darkest", "#134c57")}
  </div>
);

const warning = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Warning</div>
    {renderColor("warning-extra-light", "#faf3d1")}
    {renderColor("warning-light", "#fee685")}
    {renderColor("warning", "#ffbe2e")}
    {renderColor("warning-dark", "#e5a000")}
    {renderColor("warning-darker", "#936f38")}
  </div>
);

const error = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Error</div>
    {renderColor("error-extra-light", "#f4e3db")}
    {renderColor("error-light", "#f39268")}
    {renderColor("error", "#d54309")}
    {renderColor("error-dark", "#b51d09")}
    {renderColor("error-darker", "#6f3331")}
  </div>
);

const shades = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Shades</div>
    {renderColor("white", "#ffffff")}
    {renderColor("disabled", "#757575")}
  </div>
);

const coolNeutral = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Cool Neutral</div>
    {renderColor("cool-extra-light", "#f9fbfb")}
    {renderColor("cool-lighter", "#ddeded")}
  </div>
);

const accentCooler = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Accent Cooler</div>
    {renderColor("accent-cooler-lightest", "#ece6f2")}
    {renderColor("accent-cooler-light", "#c1add3")}
    {renderColor("accent-cooler", "#835da4")}
    {renderColor("accent-cooler-dark", "#5c3f74")}
    {renderColor("accent-cooler-darker", "#422d53")}
  </div>
);

const accentHot = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Accent Hot</div>
    {renderColor("accent-hot-extra-light", "#fae8e0")}
    {renderColor("accent-hot", "#be4e1e")}
  </div>
);

const accentSemiCool = (
  <div className="flex flex-row margin-top-4">
    <div className="h1-styling margin-right-4 width-card-lg">Accent Semi Cool</div>
    {renderColor("accent-semi-cool-extra-light", "#effffb")}
    {renderColor("accent-semi-cool-lightest", "#defff8")}
    {renderColor("accent-semi-cool-light", "#BDFFF2")}
    {renderColor("accent-semi-cool-vivid", "#009f7f")}
    {renderColor("accent-semi-cool", "#009f7f")}
  </div>
);

const Template = ({}) => (
  <div>
    <div className="h1-styling-large margin-y-4">Theme Palette</div>
    <div className="margin-y-6">
      <div>{neutralBase}</div>
      <div>{primary}</div>
      <div>{secondary}</div>
      <div>{accentCool}</div>
      <div>{accentWarm}</div>
    </div>
    <div className="h1-styling-large margin-bottom-4 margin-top-10">Alert Palette</div>
    <div className="margin-y-6">
      <div>{success}</div>
      <div>{info}</div>
      <div>{warning}</div>
      <div>{error}</div>
      <div>{shades}</div>
    </div>
    <div className="h1-styling-large margin-bottom-4 margin-top-10">New Colors</div>
    <div>{coolNeutral}</div>
    <div>{accentCooler}</div>
    <div>{accentHot}</div>
    <div>{accentSemiCool}</div>
  </div>
);

export const Colors = Template.bind({});
