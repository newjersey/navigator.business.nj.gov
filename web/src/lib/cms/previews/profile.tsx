/* eslint-disable @typescript-eslint/no-explicit-any */
import {useEffect, useRef} from "react";
import Profile from "@/pages/profile";
import {createEmptyLoadDisplayContent} from "@/lib/types/types";

type Props = {
  entry?: any;
  window: Window;
  document: Document;
  widgetsFor: (string: string) => any;
  widgetFor: (string: string) => any;
  getAsset: (string: string) => any;
};

const ProfilePreview = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref?.current?.ownerDocument.head.replaceWith(props.window.parent.document.head.cloneNode(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const { body, ...data } = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <Profile
        displayContent={createEmptyLoadDisplayContent()}
        municipalities={[]}
        hasExistingBusiness={true}
        tab={data.profileTab}
      />
    </div>
  );
};

export default ProfilePreview;
