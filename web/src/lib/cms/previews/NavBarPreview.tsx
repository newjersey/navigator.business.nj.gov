import { NavBarDesktop } from "@/components/navbar/desktop/NavBarDesktop";
import { NavBarMobile } from "@/components/navbar/mobile/NavBarMobile";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import {
  generateBusiness,
  generateBusinessNameAvailability,
  generateFormationData,
  generateProfileData,
  generateUserData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { ReactElement } from "react";

const NavBarPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const userData = generateUserData({});

  const userDataOwningNoName = generateUserDataForBusiness(
    generateBusiness({
      profileData: generateProfileData({
        businessPersona: "OWNING",
        businessName: "",
        tradeName: "",
      }),
    })
  );
  const userDataRemoteSellerWorkerNoName = generateUserDataForBusiness(
    generateBusiness({
      profileData: generateProfileData({
        businessPersona: "FOREIGN",
        businessName: "",
        tradeName: "",
        foreignBusinessTypeIds: ["employeesInNJ"],
      }),
    })
  );
  const userDataDBANoName = generateUserDataForBusiness(
    generateBusiness({
      profileData: generateProfileData({
        businessPersona: "FOREIGN",
        businessName: "",
        tradeName: "",
        nexusDbaName: "",
      }),
      formationData: generateFormationData({
        businessNameAvailability: generateBusinessNameAvailability({
          status: "UNAVAILABLE",
        }),
      }),
    })
  );

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <hr className="padding-y-10" />

        <div>Landing</div>
        <NavBarDesktop
          isLanding={true}
          currentlyOnboarding={undefined}
          isAuthenticated={false}
          CMS_PREVIEW_ONLY_SHOW_MENU={true}
        />
        <hr className="padding-y-10" />

        <div>Onboarding</div>
        <NavBarDesktop
          isLanding={undefined}
          currentlyOnboarding={true}
          isAuthenticated={false}
          CMS_PREVIEW_ONLY_SHOW_MENU={false}
        />
        <hr className="padding-y-10" />

        <div>Guest</div>
        <NavBarDesktop
          isLanding={undefined}
          currentlyOnboarding={undefined}
          isAuthenticated={false}
          CMS_PREVIEW_ONLY_SHOW_MENU={true}
          userData={userData}
        />
        <hr className="padding-y-10" />

        <div>Authed with business name</div>
        <NavBarDesktop
          isLanding={undefined}
          currentlyOnboarding={undefined}
          isAuthenticated={true}
          CMS_PREVIEW_ONLY_SHOW_MENU={true}
          userData={userData}
        />
        <div className="padding-y-10" />
        <div className="padding-y-10" />

        <div>Authed with nexus no business name</div>
        <NavBarDesktop
          isLanding={undefined}
          currentlyOnboarding={undefined}
          isAuthenticated={true}
          CMS_PREVIEW_ONLY_SHOW_MENU={true}
          userData={userDataRemoteSellerWorkerNoName}
        />
        <div className="padding-y-10" />
        <div className="padding-y-10" />

        <div>Authed with owning no business name</div>
        <NavBarDesktop
          isLanding={undefined}
          currentlyOnboarding={undefined}
          isAuthenticated={true}
          CMS_PREVIEW_ONLY_SHOW_MENU={true}
          userData={userDataOwningNoName}
        />
        <div className="padding-y-10" />
        <div className="padding-y-10" />

        <div>Authed with DBA no business name</div>
        <NavBarDesktop
          isLanding={undefined}
          currentlyOnboarding={undefined}
          isAuthenticated={true}
          CMS_PREVIEW_ONLY_SHOW_MENU={true}
          userData={userDataDBANoName}
        />
        <div className="padding-y-10" />
        <div className="padding-y-10" />

        <div className="width-mobile-lg">
          <div>Landing</div>
          <NavBarMobile
            scrolled={false}
            currentlyOnboarding={false}
            isAuthenticated={false}
            isLanding={true}
            CMS_PREVIEW_ONLY_SHOW_MENU={true}
          />
          <div className="padding-y-10" />
        </div>

        <div className="width-mobile-lg">
          <div>Onboarding</div>
          <NavBarMobile
            scrolled={false}
            currentlyOnboarding={true}
            isAuthenticated={false}
            CMS_PREVIEW_ONLY_SHOW_MENU={true}
          />
          <div className="padding-y-10" />
        </div>

        <div className="width-mobile-lg">
          <div>Guest</div>
          <NavBarMobile
            scrolled={false}
            currentlyOnboarding={false}
            isAuthenticated={false}
            userData={userData}
            CMS_PREVIEW_ONLY_SHOW_MENU={true}
          />
          <div className="height-card" />
        </div>

        <div className="width-mobile-lg">
          <div>Authed with business name</div>
          <NavBarMobile
            scrolled={false}
            currentlyOnboarding={false}
            isAuthenticated={true}
            userData={userData}
            CMS_PREVIEW_ONLY_SHOW_MENU={true}
          />
          <div className="padding-y-10" />
        </div>
        <div className="width-mobile-lg">
          <div>Authed with nexus no business name</div>
          <NavBarMobile
            scrolled={false}
            currentlyOnboarding={false}
            isAuthenticated={true}
            userData={userDataRemoteSellerWorkerNoName}
            CMS_PREVIEW_ONLY_SHOW_MENU={true}
          />
          <div className="padding-y-10" />
        </div>
        <div className="width-mobile-lg">
          <div>Authed with business name</div>
          <NavBarMobile
            scrolled={false}
            currentlyOnboarding={false}
            isAuthenticated={true}
            userData={userData}
            CMS_PREVIEW_ONLY_SHOW_MENU={true}
          />
          <div className="padding-y-10" />
        </div>
        <div className="width-mobile-lg">
          <div>Authed with owning no business name</div>
          <NavBarMobile
            scrolled={false}
            currentlyOnboarding={false}
            isAuthenticated={true}
            userData={userDataOwningNoName}
            CMS_PREVIEW_ONLY_SHOW_MENU={true}
          />
          <div className="padding-y-10" />
        </div>
      </div>
    </ConfigContext.Provider>
  );
};

export default NavBarPreview;
