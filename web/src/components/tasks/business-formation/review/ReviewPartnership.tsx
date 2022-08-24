import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { LookupTabIndexByName } from "@/components/tasks/business-formation/BusinessFormationTabsConfiguration";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { scrollToTop, setHeaderRole } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useContext } from "react";

export const ReviewPartnership = () => {
  const { state, setTab } = useContext(BusinessFormationContext);
  const headerLevelTwo = setHeaderRole(2, "h3-styling");

  return (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <Content overrides={{ h3: headerLevelTwo }}>
            {Config.businessFormationDefaults.reviewPagePartnershipHeader}
          </Content>
        </div>
        <div className="margin-left-2">
          <Button
            style="tertiary"
            onClick={() => {
              setTab(LookupTabIndexByName("Business"));
              scrollToTop();
            }}
            underline
            dataTestid="edit-partnership"
          >
            {Config.businessFormationDefaults.editButtonText}
          </Button>
        </div>
      </div>
      <div className="" data-testid="partnership">
        <div className="margin-bottom-3">
          <Content className="margin-bottom-2">
            {state.formationFormData.canCreateLimitedPartner
              ? Config.businessFormationDefaults.reviewPagePartnershipYesLimitedPartnerBody
              : Config.businessFormationDefaults.reviewPagePartnershipNoLimitedPartnerBody}
          </Content>
          {state.formationFormData.canCreateLimitedPartner ? (
            <Content className="margin-left-4">
              {[
                Config.businessFormationDefaults.reviewPagePartnershipTermTitle,
                state.formationFormData.createLimitedPartnerTerms,
              ].join(" ")}
            </Content>
          ) : (
            <></>
          )}
        </div>
        <div className="margin-bottom-3">
          <Content className="margin-bottom-2">
            {state.formationFormData.canGetDistribution
              ? Config.businessFormationDefaults.reviewPagePartnershipYesCanReceiveDistributions
              : Config.businessFormationDefaults.reviewPagePartnershipNoCanReceiveDistributions}
          </Content>
          {state.formationFormData.canGetDistribution ? (
            <Content className="margin-left-4">
              {[
                Config.businessFormationDefaults.reviewPagePartnershipTermTitle,
                state.formationFormData.getDistributionTerms,
              ].join(" ")}
            </Content>
          ) : (
            <></>
          )}
        </div>
        <div className="margin-bottom-3">
          <Content className="margin-bottom-2">
            {state.formationFormData.canMakeDistribution
              ? Config.businessFormationDefaults.reviewPagePartnershipYesCanMakeDistributions
              : Config.businessFormationDefaults.reviewPagePartnershipNoCanMakeDistributions}
          </Content>
          {state.formationFormData.canMakeDistribution ? (
            <Content className="margin-left-4">
              {[
                Config.businessFormationDefaults.reviewPagePartnershipTermTitle,
                state.formationFormData.makeDistributionTerms,
              ].join(" ")}
            </Content>
          ) : (
            <></>
          )}
        </div>
      </div>
      <hr className="margin-y-205" />
    </>
  );
};
