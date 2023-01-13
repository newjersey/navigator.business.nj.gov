import { UserSupportActionCard } from "@/components/UserSupportActionCard";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { ReactElement } from "react";

export const SupportExploreSignUpChatCards = (): ReactElement => {
  const { Config } = useConfig();
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);
  const cardConfig = Config.landingPage;

  return (
    <div className={`${isDesktopAndUp ? "flex flex-justify" : ""}`}>
      <UserSupportActionCard
        color={"primary"}
        headerLine1={cardConfig.card1HeaderLine1}
        headerLine2={cardConfig.card1HeaderLine2}
        supportingText={cardConfig.card1SupportingText}
        buttonLink={cardConfig.card1ButtonLink}
        buttonText={cardConfig.card1Button}
        buttonStyleProp="primary"
      />
      <UserSupportActionCard
        color={"accent-cooler"}
        headerLine1={cardConfig.card2HeaderLine1}
        headerLine2={cardConfig.card2HeaderLine2}
        supportingText={cardConfig.card2SupportingText}
        buttonLink={cardConfig.card2ButtonLink}
        buttonText={cardConfig.card2Button}
        buttonStyleProp="accent-cooler"
      />
      <UserSupportActionCard
        color={"info-dark"}
        headerLine1={cardConfig.card3HeaderLine1}
        headerLine2={cardConfig.card3HeaderLine2}
        supportingText={cardConfig.card3SupportingText}
        buttonLink=""
        buttonText={cardConfig.card3Button}
        buttonStyleProp="info"
        intercom={true}
        isLast
      />
    </div>
  );
};
