import { UserSupportActionCard } from "@/components/UserSupportActionCard";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { ReactElement } from "react";

export const SupportExploreSignUpChatCards = (): ReactElement<any> => {
  const { Config } = useConfig();
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);
  const cardConfig = Config.landingPage;

  return (
    <div className={`${isDesktopAndUp ? "flex flex-justify" : ""}`}>
      <UserSupportActionCard
        borderColor={"primary"}
        header={`${cardConfig.card1Header}`}
        supportingText={cardConfig.card1SupportingText}
        buttonLink={cardConfig.card1ButtonLink}
        buttonText={cardConfig.card1Button}
        primaryButtonColor="primary"
      />
      <UserSupportActionCard
        borderColor={"accent-cooler"}
        header={`${cardConfig.card2Header}`}
        supportingText={cardConfig.card2SupportingText}
        buttonLink={cardConfig.card2ButtonLink}
        buttonText={cardConfig.card2Button}
        primaryButtonColor="accent-cooler"
      />
      <UserSupportActionCard
        borderColor={"accent-semi-cool-700"}
        header={`${cardConfig.card3Header}`}
        supportingText={cardConfig.card3SupportingText}
        buttonLink=""
        buttonText={cardConfig.card3Button}
        primaryButtonColor="accent-semi-cool"
        isIntercomEnabled={true}
        isLast
      />
    </div>
  );
};
