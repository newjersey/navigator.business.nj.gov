import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { removeBusiness } from "@/lib/domain-logic/removeBusiness";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { useRouter } from "next/router";
import { ReactNode } from "react";

interface Props {
  linkText: string;
  className?: string;
  previousBusinessId?: string | undefined;
}

export const NavBarDashboardLink = (props: Props): ReactNode => {
  const router = useRouter();
  const { updateQueue, userData, business } = useUserData();
  return (
    <div>
      <UnStyledButton
        onClick={async (): Promise<void> => {
          if (props.previousBusinessId) {
            if (!updateQueue || !userData) return;
            await updateQueue
              .queue(
                removeBusiness({
                  userData,
                  newCurrentBusinessId: props.previousBusinessId,
                  idToRemove: userData.currentBusinessId,
                })
              )
              .update();
          }
          analytics.event.my_account.click.my_account();
          await router.push(ROUTES.dashboard);
        }}
        ariaLabel={
          business?.profileData.businessName
            ? `My Account for ${business?.profileData.businessName} Home`
            : "My Account Home"
        }
      >
        <span className={`text-primary text-semibold font-body-sm ${props.className ?? ""}`}>
          {props.linkText}
        </span>
      </UnStyledButton>
    </div>
  );
};
