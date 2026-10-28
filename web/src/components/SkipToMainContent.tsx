import type { ReactElement } from "react";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";

export const SkipToMainContent = (): ReactElement => {
  const { Config } = useConfig();

  return (
    <div>
      <a
        className="skip-link"
        data-testid="skip-main-content"
        href="#main"
        onClick={analytics.event.skip_to_main_content.click.skip_to_main_content}
      >
        {Config.skipToMainContent.buttonText}
      </a>
    </div>
  );
};
