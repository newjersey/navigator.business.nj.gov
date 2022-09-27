import { ConfigType, getMergedConfig } from "@/contexts/configContext";
import {
  FlowType,
  KeysOfType,
  OnboardingStatus,
  ProfileError,
  Roadmap,
  SectionCompletion,
  sectionNames,
  SectionType,
  Step,
  Task,
} from "@/lib/types/types";
import { UserData } from "@businessnjgovnavigator/shared/";
import { BusinessPersona, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ReactElement, useEffect, useRef } from "react";

const Config = getMergedConfig();

// eslint-disable-next-line react-hooks/exhaustive-deps
export const useMountEffect = (fun: () => void): void => useEffect(fun, []);

export const useOnWindowResize = (fun: () => void): void =>
  useEffect(() => {
    window.addEventListener("resize", fun);
    return function cleanup() {
      window.removeEventListener("resize", fun);
    };
  });

export const useMountEffectWhenDefined = (fun: () => void, thingToBeDefined: unknown | undefined): void => {
  const effectOccurred = useRef<boolean>(false);
  useEffect(() => {
    if (thingToBeDefined && !effectOccurred.current) {
      effectOccurred.current = true;
      fun();
    }
  }, [thingToBeDefined, fun]);
};

export const onEscape = (e: KeyboardEvent, handler: () => void): void => {
  if (e.key === "Escape") {
    e.preventDefault();
    handler();
  }
};

export const templateEval = (template: string, args: Record<string, string>): string => {
  let newTemplate = template;
  for (const key of Object.keys(args)) {
    const pattern = `\\\${${key}}`;
    newTemplate = newTemplate.replace(new RegExp(pattern, "g"), args[key]);
  }
  return newTemplate;
};

export const getTaskFromRoadmap = (roadmap: Roadmap | undefined, taskId: string): Task | undefined =>
  roadmap?.tasks.find((task) => task.id === taskId);

export const getSectionCompletion = (
  roadmap: Roadmap | undefined,
  userData: UserData | undefined
): SectionCompletion => {
  if (!roadmap || !userData) {
    return {} as SectionCompletion;
  }
  const taskMap = sectionsToTasksMap(roadmap) as Record<SectionType, Task[]>;
  return sectionNames.reduce((accumulator, currentValue: SectionType) => {
    accumulator[currentValue] =
      taskMap[currentValue]?.every((task: Task) => userData.taskProgress[task.id] === "COMPLETED") ?? false;
    return accumulator;
  }, {} as SectionCompletion);
};

interface SectionPosition {
  currentSection: SectionType;
  nextSection: SectionType | undefined;
}

export const getSectionPositions = (
  sectionCompletion: SectionCompletion,
  roadmap: Roadmap,
  taskId: string
): SectionPosition => {
  const currentSection = stepInRoadmap(roadmap, taskId)?.section as SectionType;
  const nextSection = sectionNames
    .slice(sectionNames.indexOf(currentSection))
    .find((currentValue: SectionType) => !sectionCompletion[currentValue]);
  return { currentSection, nextSection };
};

export const getModifiedTaskContent = (
  roadmap: Roadmap | undefined,
  task: Task,
  field: KeysOfType<Task, string>
): string => {
  const taskInRoadmap = getTaskFromRoadmap(roadmap, task.id);
  if (taskInRoadmap && taskInRoadmap[field] !== task[field]) {
    return taskInRoadmap[field] || "";
  }
  return task[field] || "";
};

export const getModifiedTaskBooleanUndefined = (
  roadmap: Roadmap | undefined,
  task: Task,
  field: KeysOfType<Task, boolean | undefined>
): boolean | undefined => {
  const taskInRoadmap = getTaskFromRoadmap(roadmap, task.id);
  if (taskInRoadmap && taskInRoadmap[field] !== task[field]) {
    return taskInRoadmap[field] || undefined;
  }
  return task[field] || undefined;
};

export const rswitch = <T,>(param: string, cases: { default: T; [k: string]: T }): T => {
  return cases[param] ?? cases.default;
};

export const scrollToTop = (props?: { smooth?: boolean }): void => {
  props?.smooth
    ? setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100)
    : window.scrollTo(0, 0);
};

export const scrollToTopOfElement = (
  element: HTMLDivElement | null,
  { isDesktop }: { isDesktop: boolean }
) => {
  let y = 0;
  if (element) {
    y = window.scrollY + element.getBoundingClientRect().top;
    if (!isDesktop) {
      const mobileNavBarHeight = 47;
      y -= mobileNavBarHeight;
    }
  }
  setTimeout(() => window.scrollTo({ top: y, behavior: "smooth" }), 100);
};

export const isStepCompleted = (
  roadmap: Roadmap | undefined,
  step: Step,
  userData: UserData | undefined
): boolean => {
  if (!roadmap) {
    return false;
  }
  return roadmap.tasks.every(
    (currentTask) =>
      currentTask.stepNumber == step.stepNumber && userData?.taskProgress[currentTask.id] !== "COMPLETED"
  );
};

interface AlertProps {
  variant: "success" | "warning" | "error";
  body: string;
  header?: string;
  link?: string;
}

export const OnboardingStatusLookup = (
  configOverrides?: ConfigType
): Record<OnboardingStatus, AlertProps> => {
  const config = configOverrides ?? getMergedConfig();
  return {
    SUCCESS: {
      body: config.profileDefaults.successTextBody,
      header: config.profileDefaults.successTextHeader,
      variant: "success",
    },
    ERROR: {
      body: config.profileDefaults.errorTextBody,
      header: config.profileDefaults.errorTextHeader,
      variant: "error",
    },
  };
};

export const OnboardingErrorLookup: Record<ProfileError, string> = {
  REQUIRED_LEGAL: getMergedConfig().profileDefaults["STARTING"].legalStructureId.errorTextRequired,
  REQUIRED_EXISTING_BUSINESS: getMergedConfig().profileDefaults.businessPersona.errorTextRequired,
  REQUIRED_FOREIGN_BUSINESS_TYPE:
    getMergedConfig().profileDefaults["FOREIGN"].foreignBusinessTypeIds.errorTextRequired,
  REQUIRED_NEXUS_LOCATION_IN_NJ:
    getMergedConfig().profileDefaults["FOREIGN"].nexusLocationInNewJersey.errorTextRequired,
};

export const getUserNameOrEmail = (userData: UserData | undefined): string => {
  if (userData?.user.name) return userData.user.name;
  else if (userData?.user.email) return userData.user.email;
  else return getMergedConfig().navigationDefaults.myNJAccountText;
};

export const validateEmail = (email: string): boolean => {
  return !!/^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))$/.test(
    String(email).toLowerCase()
  );
};

export const validateFullName = (name: string | undefined): { isValid: boolean; errorMessage: string } => {
  if (!name || name.length === 0) {
    return { isValid: false, errorMessage: Config.selfRegistration.errorTextFullName };
  }
  if (name.length > 50) {
    return { isValid: false, errorMessage: Config.selfRegistration.errorTextFullNameLength };
  }
  const startsWithLetterRegex = /^[A-Za-z]/;
  if (!startsWithLetterRegex.test(name)) {
    return { isValid: false, errorMessage: Config.selfRegistration.errorTextFullNameStartWithLetter };
  }
  const allowedCharactersRegex = /^[\w ',.-]*$/;
  if (!allowedCharactersRegex.test(name)) {
    return { isValid: false, errorMessage: Config.selfRegistration.errorTextFullNameSpecialCharacter };
  }

  return {
    isValid: true,
    errorMessage: "",
  };
};

export const getUrlSlugs = (roadmap: Roadmap | undefined): string[] => {
  if (!roadmap) return [];
  return roadmap.tasks.map((task) => task.urlSlug);
};

export const setHeaderRole = (
  ariaLevel: number,
  classProperties?: string
): (({ children }: { children: string[] }) => ReactElement) => {
  const createElement = ({ children }: { children: string[] }): ReactElement => {
    return (
      <div role="heading" aria-level={ariaLevel} className={classProperties ?? ""}>
        {children}
      </div>
    );
  };

  return createElement;
};

export const getSectionNames = (roadmap: Roadmap | undefined): SectionType[] => {
  if (!roadmap) return [];
  const { steps } = roadmap;
  const sections: SectionType[] = [];
  for (const step of steps) {
    sections.push(step.section);
  }
  return [...new Set(sections)];
};

export const createRoadmapSections = (
  roadmapSections: SectionType[],
  userData: UserData | undefined,
  getSection: (sectionName: SectionType, openStatus: boolean | undefined) => JSX.Element
): JSX.Element[] => {
  return roadmapSections.map((sectionName) => {
    const openStatus = userData?.preferences.roadmapOpenSections.includes(sectionName);
    return getSection(sectionName, openStatus);
  });
};

export const getPhoneNumberFormat = (phoneNumber: string) => {
  const length = phoneNumber.length;
  if (length === 0) return phoneNumber;
  if (length < 4) return `(${phoneNumber}`;
  if (length < 7) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

export const camelCaseToSentence = (text: string): string => {
  const spacedCase = text
    .split(/(?=[A-Z])/)
    .join(" ")
    .toLowerCase();
  return spacedCase.charAt(0).toUpperCase() + spacedCase.slice(1);
};

export const camelCaseToSnakeCase = (text: string): string => {
  return text
    .split(/(?=[A-Z])/)
    .join("-")
    .toLowerCase();
};

const sectionsToTasksMap = (roadmap: Roadmap | undefined): Record<SectionType, Task[]> | undefined =>
  roadmap?.steps.reduce((accumulator, currentStep: Step) => {
    const currentStepTasks = roadmap.tasks.filter((task) => task.stepNumber === currentStep.stepNumber);
    accumulator[currentStep.section] = [...(accumulator[currentStep.section] || []), ...currentStepTasks];
    return accumulator;
  }, {} as Record<SectionType, Task[]>);

const stepInRoadmap = (roadmap: Roadmap | undefined, taskId: string): Step | undefined => {
  const taskAtHand = roadmap?.tasks.find((task) => task.id === taskId);
  if (!taskAtHand) return;
  return roadmap?.steps.find((step) => step.stepNumber === taskAtHand.stepNumber);
};
export const splitAndBoldSearchText = (displayText: string, searchText: string): ReactElement => {
  const index = displayText.toLowerCase().indexOf(searchText.toLowerCase());
  if (index >= 0) {
    const prefixText = displayText.slice(0, Math.max(0, index));
    const toBold = displayText.slice(index, index + searchText.length);
    const afterText = displayText.slice(index + searchText.length);
    return (
      <span style={{ whiteSpace: "pre-wrap" }}>
        {prefixText}
        <span className="text-bold">{toBold}</span>
        {afterText}
      </span>
    );
  } else {
    return <>{displayText}</>;
  }
};

export const getDollarValue = (currVal: string | number): string => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number.parseFloat(currVal.toString())
  );
};

export const zipCodeRange = (value: string) => {
  const parsedValue = Number.parseInt(value);
  if (typeof parsedValue !== "number") return false;
  return parsedValue >= 7001 && parsedValue <= 8999;
};

export const getStringifiedAddress = (
  addressLine1: string,
  city: string,
  state: string,
  zipcode: string,
  addressLine2?: string
) => {
  return `${addressLine1}, ${addressLine2 ? `${addressLine2}, ` : ""}${city}, ${state}, ${zipcode}`;
};

export const getFlow = (data: UserData | ProfileData): FlowType => {
  const persona: BusinessPersona = isUserData(data) ? data.profileData.businessPersona : data.businessPersona;

  return persona || "STARTING";
};

export function isUserData(data: UserData | ProfileData): data is UserData {
  return (data as UserData).user !== undefined;
}

export const makeButtonIcon = (svgFilename: string, size = "20px"): ReactElement => (
  <img
    className="margin-right-05 margin-left-neg-1"
    width={size}
    height={size}
    src={`/img/${svgFilename}.svg`}
    alt=""
  />
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const flattenObject = (obj: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flattened: any = {};

  if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
    for (const key of Object.keys(obj)) {
      const value = obj[key];

      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, flattenObject(value));
      } else {
        flattened[key] = value;
      }
    }

    return flattened;
  } else {
    return obj;
  }
};
