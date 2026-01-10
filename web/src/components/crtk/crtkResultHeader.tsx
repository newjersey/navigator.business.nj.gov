import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import SearchIcon from "@mui/icons-material/Search";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import { ReactElement } from "react";

type StatusType = "FOUND" | "NOT_FOUND";

interface StatusColorScheme {
  bgHdrColor: string;
  bgSubHdrColor: string;
  textAndIconColor?: string;
  icon: ReactElement;
}

interface StatusContent {
  header: string;
  description: string;
  callToAction?: {
    text: string;
    onClick: () => void;
  };
}

interface Props {
  status: StatusType;
  headerLabel: string;
  statusContent: Partial<Record<StatusType, StatusContent>>;
  colorScheme?: Partial<Record<StatusType, StatusColorScheme>>;
  testIdPrefix?: string;
}

const defaultColorScheme: Record<StatusType, StatusColorScheme> = {
  NOT_FOUND: {
    bgHdrColor: "bg-base-dark",
    bgSubHdrColor: "bg-base-lighter",
    icon: (
      <SearchIcon
        className="display-none tablet:display-block tablet:margin-left-1 radius-pill bg-base-dark text-white"
        sx={{ fontSize: "1.5rem", padding: "0.2rem" }}
      />
    ),
  },
  FOUND: {
    bgHdrColor: "bg-warning",
    bgSubHdrColor: "bg-warning-lighter",
    textAndIconColor: "text-accent-warm-darker",
    icon: (
      <WatchLaterIcon className="display-none tablet:display-block tablet:margin-left-1 tablet:usa-icon--size-8" />
    ),
  },
};

export const StatusResultHeader = (props: Props): ReactElement => {
  const { status, headerLabel, statusContent } = props;

  const colorScheme = {
    ...defaultColorScheme,
    ...props.colorScheme,
  };

  const currentScheme = colorScheme[status];
  const currentContent = statusContent[status];

  if (!currentContent) {
    console.error(`No content provided for status: ${status}`);
    return <></>;
  }

  return (
    <div className={`fdc radius-lg ${currentScheme.bgSubHdrColor}`}>
      <div
        className={`${currentScheme.bgHdrColor} ${currentScheme.textAndIconColor ?? "text-white"} width-full radius-top-lg padding-y-05 padding-x-205 margin-0 text-bold`}
      >
        {headerLabel}
      </div>

      <div className="margin-205">
        <div className={`fdr fac ${currentScheme.textAndIconColor} width-full font-sans-lg`}>
          {currentScheme.icon}

          <p className="text-bold tablet:margin-left-105 line-height-sans-4">
            {currentContent.header}
          </p>
        </div>

        <div className={`tablet:padding-x-105 ${currentScheme.textAndIconColor}`}>
          {currentContent.description}
          {currentContent.callToAction && (
            <>
              <UnStyledButton
                isBgTransparent
                isUnderline
                isButtonALink
                isTextBold={false}
                className={`${currentScheme.textAndIconColor} text-normal padding-0 margin-left-05`}
                onClick={currentContent.callToAction.onClick}
              >
                <span className="text-underline">{currentContent.callToAction.text}</span>
              </UnStyledButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
