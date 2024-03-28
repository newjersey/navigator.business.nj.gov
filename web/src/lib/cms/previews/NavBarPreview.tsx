import { NavBarDesktop } from "@/components/navbar/desktop/NavBarDesktop";
import { NavBarMobile } from "@/components/navbar/mobile/NavBarMobile";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { generateUserData } from "@businessnjgovnavigator/shared/test";
import { ReactElement, useState } from "react";
import { create, InsertionPoint } from "jss";
import { jssPreset, StylesProvider } from "@mui/styles";

const NavBarPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userData, setUserData] = useState(generateUserData({}));


  const iframe = document.querySelector('#nc-root iframe');
  const iframeHeadElem = iframe && iframe.ownerDocument.head;

  if (!iframeHeadElem) {
    return <></>;
  }
  if(!iframeHeadElem.firstChild){
    return <></>;
  }

  const jss = create({
    plugins: [...jssPreset().plugins],
    insertionPoint: iframeHeadElem.firstChild as InsertionPoint, // a bit sketchy
  });


  return (
    <>
    <StylesProvider jss={jss}>
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
        <NavBarDesktop isLanding={undefined} currentlyOnboarding={true} isAuthenticated={false} />
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

        <div>Authed</div>
        <NavBarDesktop
          isLanding={undefined}
          currentlyOnboarding={undefined}
          isAuthenticated={true}
          CMS_PREVIEW_ONLY_SHOW_MENU={true}
          userData={userData}
        />
        <div className="padding-y-10" />

        <div className="padding-y-10">Break</div>

        <div>Landing</div>
        <NavBarMobile
          scrolled={false}
          currentlyOnboarding={false}
          isAuthenticated={false}
          isLanding={true}
          CMS_PREVIEW_ONLY_SHOW_MENU={true}
        />
        <div className="padding-y-15" />

        <div>Onboarding</div>
        <NavBarMobile
          scrolled={false}
          currentlyOnboarding={true}
          isAuthenticated={false}
          CMS_PREVIEW_ONLY_SHOW_MENU={true}
        />
        <div className="padding-y-15" />

        <div>Guest</div>
        <NavBarMobile
          scrolled={false}
          currentlyOnboarding={false}
          isAuthenticated={false}
          userData={userData}
          CMS_PREVIEW_ONLY_SHOW_MENU={true}
        />
        <div className="padding-y-15" />

        <div>Authed</div>
        <NavBarMobile
          scrolled={false}
          currentlyOnboarding={false}
          isAuthenticated={true}
          userData={userData}
          CMS_PREVIEW_ONLY_SHOW_MENU={true}
        />
        <div className="padding-y-15" />
      </div>
    </ConfigContext.Provider>
    </StylesProvider>
    </>
  );
};

export default NavBarPreview;
