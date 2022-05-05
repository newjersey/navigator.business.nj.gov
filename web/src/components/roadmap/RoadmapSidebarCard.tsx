import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import React from "react";

type Props = {
  color: string;
  shadowColor: string;
  headerText?: string;
  onClose?: () => void;
  imgLink?: string;
  dataTestid?: string;
  imagePath?: string;
  children: React.ReactNode;
};

export const RoadmapSidebarCard = ({
  color,
  shadowColor,
  headerText,
  onClose,
  dataTestid,
  imagePath,
  children,
}: Props) => {
  return (
    <div
      className={`border radius-sm border-${color} box-shadow-${shadowColor} margin-left-05 margin-bottom-3`}
      {...(dataTestid ? { "data-testid": dataTestid } : {})}
    >
      {headerText && (
        <div className={`bg-${shadowColor} padding-y-105 padding-x-205`}>
          {onClose ? (
            <div className="flex flex-justify">
              <h2 className={`margin-bottom-0 text-${color} ${imagePath ? "flex" : ""}`}>
                {imagePath && (
                  <img
                    role="presentation"
                    className="margin-right-2 height-4 width-4"
                    src={imagePath}
                    alt=""
                  />
                )}
                <span>{headerText}</span>
              </h2>
              <Button style="tertiary" onClick={onClose} ariaLabel="Close">
                <Icon className={`font-sans-xl text-${color}`}>close</Icon>
              </Button>
            </div>
          ) : (
            <h2 className={`margin-bottom-0 text-${color} ${imagePath ? "flex" : ""}`}>
              {imagePath && (
                <img role="presentation" className="margin-right-2 height-4 width-4" src={imagePath} alt="" />
              )}
              <span>{headerText}</span>
            </h2>
          )}
        </div>
      )}
      <div className="bg-white padding-205 text-base">{children}</div>
    </div>
  );
};
