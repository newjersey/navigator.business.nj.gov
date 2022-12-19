import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { CircularProgress } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

interface Props {
  saveEveryXSeconds: number;
  secondsBetweenSpinAnimations: number;
  spinForXSeconds: number;
  hasDataChanged: boolean;
  saveDataFunction: () => void;
}

export const AutosaveSpinner = (props: Props) => {
  const [savingSpinnerClock, setSavingSpinnerClock] = useState<"HIDDEN" | "SAVING" | "SAVED">("HIDDEN");
  const [savingSpinnerState, setSavingSpinnerState] = useState<"HIDDEN" | "SAVING" | "SAVED">("HIDDEN");
  const [timestampOfLastSave, setTimestampOfLastSave] = useState<number>(0);
  const [timestampOfLastSpinAnimation, setTimestampOfLastSpinAnimation] = useState<number>(0);
  const { Config } = useConfig();

  useEffect(() => {
    return (function setupSpinnerIntervalClock() {
      let timeout: NodeJS.Timeout;
      const interval = setInterval(() => {
        setSavingSpinnerClock("SAVING");
        timeout = setTimeout(() => {
          setSavingSpinnerClock("SAVED");
        }, props.spinForXSeconds * 1000);
      }, props.secondsBetweenSpinAnimations * 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (function determineSpinnerState() {
      if (savingSpinnerClock === "SAVING") {
        const hasSavedDuringLastInterval =
          timestampOfLastSave > 0 &&
          dayjs().valueOf() - timestampOfLastSave <= props.secondsBetweenSpinAnimations * 1000;
        if (hasSavedDuringLastInterval) {
          setTimestampOfLastSpinAnimation(dayjs().valueOf());
          setSavingSpinnerState("SAVING");
        } else {
          setSavingSpinnerState("HIDDEN");
        }
      } else if (savingSpinnerClock === "SAVED") {
        const didSpinAnimationThisInterval =
          timestampOfLastSpinAnimation > 0 &&
          dayjs().valueOf() - timestampOfLastSpinAnimation <= props.secondsBetweenSpinAnimations * 1000;
        setSavingSpinnerState(didSpinAnimationThisInterval ? "SAVED" : "HIDDEN");
      } else {
        setSavingSpinnerState("HIDDEN");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savingSpinnerClock]);

  useEffect(() => {
    (function autoSaveOnFieldChangeWithInterval() {
      const hasSaveIntervalElapsed =
        dayjs().valueOf() - timestampOfLastSave >= props.saveEveryXSeconds * 1000;

      if (props.hasDataChanged && hasSaveIntervalElapsed) {
        setTimestampOfLastSave(dayjs().valueOf());
        props.saveDataFunction();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.hasDataChanged, props.saveDataFunction]);

  switch (savingSpinnerState) {
    case "SAVING":
      return (
        <>
          <CircularProgress size="1.5rem" />
          <div className="margin-left-1">{Config.autosaveDefaults.savingText}</div>
        </>
      );
    case "SAVED":
      return (
        <>
          <Icon>check</Icon>
          <div className="margin-left-1">{Config.autosaveDefaults.savedText}</div>
        </>
      );
    case "HIDDEN":
      return <></>;
  }
};
