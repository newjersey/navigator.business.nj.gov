import { BetaBar } from "@/components/BetaBar";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { fireEvent, render } from "@testing-library/react";
import React from "react";

describe("<BetaBar />", () => {
  it("opens modal on button click", () => {
    const subject = render(<BetaBar />);
    expect(subject.queryByText(Config.betaBar.betaModalTitle)).not.toBeInTheDocument();
    fireEvent.click(subject.getByText(Config.betaBar.betaModalButtonText));
    expect(subject.queryByText(Config.betaBar.betaModalTitle)).toBeInTheDocument();
  });
});
