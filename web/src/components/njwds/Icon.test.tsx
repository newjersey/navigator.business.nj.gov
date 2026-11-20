import { render } from "@testing-library/react";
import { Icon } from "@/components/njwds/Icon";

describe("<Icon />", () => {
  it("references the named icon in the NJWDS sprite", () => {
    const { container } = render(<Icon iconName="mail" />);

    const uses = container.querySelectorAll("svg use");
    expect(uses).toHaveLength(1);
    expect(uses[0].getAttribute("xlink:href")).toBe("/vendor/img/sprite.svg#mail");
  });

  it("does not parse markup in iconName as elements", () => {
    const iconNameWithMarkup =
      'mail"></use><image href="https://example.com/a.png"></image><use xlink:href="';

    const { container } = render(<Icon iconName={iconNameWithMarkup} />);

    expect(container.querySelector("image")).toBeNull();
    expect(container.querySelectorAll("svg use")).toHaveLength(1);
  });
});
