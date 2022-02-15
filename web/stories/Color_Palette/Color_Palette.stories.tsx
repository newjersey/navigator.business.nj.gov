import React from "react";
import { withDesign } from "storybook-addon-designs";

export default {
  title: "DesignSystem",
  decorators: [withDesign],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/EraDAUUvuOksWZtTgp2c9I/BFS-Design-System?node-id=1173%3A2209",
    },
  },
};

const base = (
  <div className="margin-right-2">
    <div className="margin-bottom-2">Base</div>
    <div className="margin-bottom-2 height-10 width-15 bg-base-lightest text-base-darkest text-bold">
      base-lightest
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-base-lighter text-base-darkest text-bold">
      base-lighter
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-base-light text-base-darkest text-bold">
      base-light
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-base text-base-lightest text-bold">base</div>
    <div className="margin-bottom-2 height-10 width-15 bg-base-dark text-base-lightest text-bold">
      base-dark
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-base-darkest text-base-lightest text-bold">
      base-darkest
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-ink text-base-lightest text-bold">ink</div>
  </div>
);

const primary = (
  <div className="margin-right-2">
    <div className="margin-bottom-2">Primary</div>
    <div className="margin-bottom-2 height-10 width-15 bg-primary-lighter text-base-darkest text-bold">
      primary-lighter
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-primary-light text-base-darkest text-bold">
      primary-light
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-primary text-base-lightest text-bold">primary</div>
    <div className="margin-bottom-2 height-10 width-15 bg-primary-vivid text-base-lightest text-bold">
      primary-vivid
    </div>

    <div className="margin-bottom-2 height-10 width-15 bg-primary-dark text-base-lightest text-bold">
      primary-dark
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-primary-darker text-base-lightest text-bold">
      primary-darker
    </div>
  </div>
);

const secondary = (
  <div className="margin-right-2">
    <div className="margin-bottom-2">secondary</div>
    <div className="margin-bottom-2 height-10 width-15 bg-secondary-lighter text-base-darkest text-bold">
      secondary-lighter
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-secondary-light text-base-darkest text-bold">
      secondary-light
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-secondary text-base-lightest text-bold">
      secondary
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-secondary-vivid text-base-lightest text-bold">
      secondary-vivid
    </div>

    <div className="margin-bottom-2 height-10 width-15 bg-secondary-dark text-base-lightest text-bold">
      secondary-dark
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-secondary-darker text-base-lightest text-bold">
      secondary-darker
    </div>
  </div>
);

const accentCool = (
  <div className="margin-right-2">
    <div className="margin-bottom-2">accent-cool</div>
    <div className="margin-bottom-2 height-10 width-15 bg-accent-cool-lighter text-base-darkest text-bold">
      accent-cool-lighter
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-accent-cool-light text-base-darkest text-bold">
      accent-cool-light
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-accent-cool text-base-lightest text-bold">
      accent-cool
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-accent-cool-dark text-base-lightest text-bold">
      accent-cool-dark
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-accent-cool-darker text-base-lightest text-bold">
      accent-cool-darker
    </div>
  </div>
);

const accentWarm = (
  <div className="margin-right-2">
    <div className="margin-bottom-2">accent-warm</div>
    <div className="margin-bottom-2 height-10 width-15 bg-accent-warm-lighter text-base-darkest text-bold">
      accent-warm-lighter
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-accent-warm-light text-base-darkest text-bold">
      accent-warm-light
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-accent-warm text-base-lightest text-bold">
      accent-warm
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-accent-warm-dark text-base-lightest text-bold">
      accent-warm-dark
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-accent-warm-darker text-base-lightest text-bold">
      accent-warm-darker
    </div>
  </div>
);

const info = (
  <div className="margin-right-2">
    <div className="margin-bottom-2">info</div>
    <div className="margin-bottom-2 height-10 width-15 bg-info-lighter text-base-darkest text-bold">
      info-lighter
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-info-light text-base-darkest text-bold">
      info-light
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-info text-base-lightest text-bold">info</div>
    <div className="margin-bottom-2 height-10 width-15 bg-info-dark text-base-lightest text-bold">
      info-dark
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-info-darker text-base-lightest text-bold">
      info-darker
    </div>
  </div>
);

const error = (
  <div className="margin-right-2">
    <div className="margin-bottom-2">error</div>
    <div className="margin-bottom-2 height-10 width-15 bg-error-lighter text-base-darkest text-bold">
      error-lighter
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-error-light text-base-darkest text-bold">
      error-light
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-error text-base-lightest text-bold">error</div>
    <div className="margin-bottom-2 height-10 width-15 bg-error-dark text-base-lightest text-bold">
      error-dark
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-error-darker text-base-lightest text-bold">
      error-darker
    </div>
  </div>
);

const warning = (
  <div className="margin-right-2">
    <div className="margin-bottom-2">warning</div>
    <div className="margin-bottom-2 height-10 width-15 bg-warning-lighter text-base-darkest text-bold">
      warning-lighter
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-warning-light text-base-darkest text-bold">
      warning-light
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-warning text-base-lightest text-bold">warning</div>
    <div className="margin-bottom-2 height-10 width-15 bg-warning-dark text-base-lightest text-bold">
      warning-dark
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-warning-darker text-base-lightest text-bold">
      warning-darker
    </div>
  </div>
);

const success = (
  <div className="margin-right-2">
    <div className="margin-bottom-2">success</div>
    <div className="margin-bottom-2 height-10 width-15 bg-success-lighter text-base-darkest text-bold">
      success-lighter
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-success-light text-base-darkest text-bold">
      success-light
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-success text-base-lightest text-bold">success</div>
    <div className="margin-bottom-2 height-10 width-15 bg-success-dark text-base-lightest text-bold">
      success-dark
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-success-darker text-base-lightest text-bold">
      success-darker
    </div>
  </div>
);

const disabled = (
  <div className="margin-right-2">
    <div className="margin-bottom-2">disabled</div>
    <div className="margin-bottom-2 height-10 width-15 bg-disabled-light text-base-darkest text-bold">
      disabled-light 'base lighter'
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-disabled text-base-darkest text-bold">disabled</div>
    <div className="margin-bottom-2 height-10 width-15 bg-disabled-dark text-base-darkest text-bold">
      disabled-dark 'base light'
    </div>
    <div className="margin-bottom-2 height-10 width-15 bg-white text-base-darkest text-bold">white</div>
    <div className="margin-bottom-2 height-10 width-15 bg-black text-base-lightest text-bold">black</div>
  </div>
);

const Template = ({}) => (
  <div className="flex flex-row">
    <div>{base}</div>
    <div>{primary}</div>
    <div>{secondary}</div>
    <div>{accentCool}</div>
    <div>{accentWarm}</div>
    <div>{info}</div>
    <div>{error}</div>
    <div>{warning}</div>
    <div>{success}</div>
    <div>{disabled}</div>
  </div>
);

export const Colors = Template.bind({});
