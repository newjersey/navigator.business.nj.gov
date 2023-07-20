import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { AuthContext } from "@/contexts/authContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import { removeBusiness } from "@/lib/domain-logic/removeBusiness";
import { ROUTES } from "@/lib/domain-logic/routes";
import { templateEval } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { useRouter } from "next/router";
import { ReactElement, useContext } from "react";

interface Props {
  previousBusiness: Business | undefined;
}

export const ReturnToPreviousBusinessBar = (props: Props): ReactElement | null => {
  const { updateQueue, userData } = useUserData();
  const { state } = useContext(AuthContext);
  const router = useRouter();
  const businessName = getNavBarBusinessTitle(props.previousBusiness, state.isAuthenticated);

  if (!props.previousBusiness) return null;

  const onClick = async (): Promise<void> => {
    if (!updateQueue || !userData || !props.previousBusiness) return;

    await updateQueue
      .queue(
        removeBusiness({
          userData,
          newCurrentBusinessId: props.previousBusiness.id,
          idToRemove: userData.currentBusinessId,
        })
      )
      .update();
    await router.push(ROUTES.dashboard);
  };

  return (
    <div className="display-flex flex-align-center bg-accent-cool-lightest border-accent-cool-light border-1px text-accent-cool-darker font-sans-xs minh-3 margin-auto padding-y-1">
      <div className="grid-container-widescreen desktop:padding-x-7 width-full">
        <UnStyledButton
          style="default"
          className="fdr fac usa-link-hover-override"
          onClick={onClick}
          dataTestid="return-to-prev-button"
        >
          <div className="bg-accent-cool-darker circle-3 icon-blue-bg-color-hover">
            <Icon className="text-white usa-icon--size-3">arrow_back</Icon>
          </div>
          <div className="margin-left-2 margin-y-auto font-sans-xs text-accent-cool-darker underline">
            {templateEval(Config.onboardingDefaults.returnToPreviousBusiness, {
              previousBusiness: businessName,
            })}
          </div>
        </UnStyledButton>
      </div>
    </div>
  );
};
