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
      className={`border radius-md border-${color} box-shadow-${shadowColor} margin-left-05 margin-bottom-3`}
      {...(dataTestid ? { "data-testid": dataTestid } : {})}
    >
      {headerText && (
        <div className={`bg-${shadowColor} padding-y-105 padding-x-205 radius-top-md`}>
          {onClose ? (
            <div className="flex flex-justify">
              <h3 className={`margin-bottom-0 text-${color} ${imagePath ? "flex flex-align-end" : ""}`}>
                {imagePath && (
                  <img
                    role="presentation"
                    className="margin-right-2 height-4 width-4"
                    src={imagePath}
                    alt=""
                  />
                )}
                <span>{headerText}</span>
              </h3>
              <Button style="tertiary" onClick={onClose} ariaLabel="Close">
                <Icon className={`font-sans-xl text-${color}`}>close</Icon>
              </Button>
            </div>
          ) : (
            <h3 className={`margin-bottom-0 text-${color} ${imagePath ? "flex flex-align-end" : ""}`}>
              {imagePath && (
                <img role="presentation" className="margin-right-2 height-4 width-4" src={imagePath} alt="" />
              )}
              <span>{headerText}</span>
            </h3>
          )}
        </div>
      )}
      <div className={`bg-white padding-205 text-base radius-bottom-md ${!headerText && "radius-top-md"}`}>
        {children}
      </div>
    </div>
  );
};
