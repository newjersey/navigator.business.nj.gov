import { ConfigType, getMergedConfig } from "@/contexts/configContext";
import { FlowType, OnboardingStatus } from "@/lib/types/types";
import {
  BusinessPersona,
  FormationLegalType,
  Municipality,
  MunicipalityDetail,
  ProfileData,
  TaskProgress,
  UserData,
} from "@businessnjgovnavigator/shared";
import { getCurrentBusiness } from "@businessnjgovnavigator/shared/domain-logic/getCurrentBusiness";
import { useEffect, useRef } from "react";

export const useMountEffect = (fun: () => void): void => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useEffect(fun, []);
};

export const groupBy = <T>(array: T[], predicate: (value: T, index: number, array: T[]) => string): T[][] =>
  Object.values(
    array.reduce((acc, value, index, array) => {
      (acc[predicate(value, index, array)] ||= []).push(value);
      return acc;
    }, {} as { [key: string]: T[] })
  );

export const useOnWindowResize = (fun: () => void): void => {
  return useEffect(() => {
    window.addEventListener("resize", fun);
    return function cleanup() {
      window.removeEventListener("resize", fun);
    };
  });
};

export const useMountEffectWhenDefined = (fun: () => void, thingToBeDefined: unknown | undefined): void => {
  const effectOccurred = useRef<boolean>(false);
  useEffect(() => {
    if (thingToBeDefined && !effectOccurred.current) {
      effectOccurred.current = true;
      fun();
    }
  }, [thingToBeDefined, fun]);
};

// export const useMountEffectWhenAllAreDefined = (
//   fun: () => void,
//   thingsToBeDefined: unknown[] | undefined
// ): void => {
//   const effectOccurred = useRef<boolean>(false);
//   useEffect(() => {
//     if (thingsToBeDefined?.every((thing) => thing) && !effectOccurred.current) {
//       effectOccurred.current = true;
//       fun();
//     }
//   }, [thingsToBeDefined, fun]);
// };

export const useScrollToPathAnchor = (): void => {
  useEffect(() => {
    if (window.location.pathname === "/mgmt/cms") return;

    const path = window.location.hash;
    if (path && path.includes("#")) {
      const id = path.replace("#", "");
      const element = document.querySelector(`#${id}`);
      if (id && element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  });
};

export const getTaskStatusUpdatedMessage = (taskStatus: TaskProgress): string => {
  const Config = getMergedConfig();

  const taskUpdatedMessagePrefix = Config.taskDefaults.taskProgressSnackbarPrefix;

  switch (taskStatus) {
    case "NOT_STARTED":
      return `${taskUpdatedMessagePrefix} "${Config.taskProgress.NOT_STARTED}"`;
    case "IN_PROGRESS":
      return `${taskUpdatedMessagePrefix} "${Config.taskProgress.IN_PROGRESS}"`;
    case "COMPLETED":
      return `${taskUpdatedMessagePrefix} "${Config.taskProgress.COMPLETED}"`;
  }
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
    newTemplate = newTemplate.replaceAll(new RegExp(pattern, "g"), args[key]);
  }
  return newTemplate;
};

export const templateEvalWithExtraSpaceRemoval = (template: string, args: Record<string, string>): string => {
  let newTemplate = template;
  for (const key of Object.keys(args)) {
    const pattern = `\\\${${key}} `;
    newTemplate = newTemplate.replaceAll(new RegExp(pattern, "g"), args[key]);
  }
  return newTemplate;
};

export const rswitch = <T>(param: string, cases: { default: T; [k: string]: T }): T => {
  return cases[param] ?? cases.default;
};

export const scrollToTop = (props?: { smooth?: boolean }): void => {
  props?.smooth
    ? setTimeout(() => {
        return window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100)
    : window.scrollTo(0, 0);
};

export const NAVBAR_WRAPPER_MOBILE_ID = "NAVBAR_WRAPPER_MOBILE_ID";
export const NAVBAR_WRAPPER_DESKTOP_ID = "NAVBAR_WRAPPER_DESKTOP_ID";

const getNavBarHeight = (): number | undefined => {
  const navbarMobile = document.querySelector(`#${NAVBAR_WRAPPER_MOBILE_ID}`);
  const navbarDesktop = document.querySelector(`#${NAVBAR_WRAPPER_DESKTOP_ID}`);

  if (navbarDesktop && navbarMobile) {
    const heightDesktop = Number.parseInt(getComputedStyle(navbarDesktop).height);
    const heightMobile = Number.parseInt(getComputedStyle(navbarMobile).height);
    if (!Number.isNaN(heightDesktop)) {
      return heightDesktop;
    } else if (!Number.isNaN(heightMobile)) {
      return heightMobile;
    }
  }
  return undefined;
};

export const scrollToTopOfElement = (
  element: HTMLDivElement | null,
  { waitTime = 100, focusElement = false }: { waitTime?: number; focusElement?: boolean }
): void => {
  if (element === null) {
    return;
  }
  let y = 0;

  if (element) {
    y = window.scrollY + element.getBoundingClientRect().top;
    const navBarHeight = getNavBarHeight();
    if (navBarHeight) {
      y -= navBarHeight + 5;
    } else {
      return;
    }
  }

  setTimeout(() => {
    window.scrollTo({ top: y, behavior: "smooth" });
  }, waitTime);

  if (focusElement) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio === 1) {
            setTimeout(() => {
              element.focus();
            }, waitTime);
            observer.disconnect();
          }
        }
      },
      {
        threshold: 1,
      }
    );

    observer.observe(element);
  }
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
      body: config.profileDefaults.default.successTextBody,
      header: config.profileDefaults.default.successTextHeader,
      variant: "success",
    },
    ERROR: {
      body: config.profileDefaults.default.errorTextBody,
      header: config.profileDefaults.default.errorTextHeader,
      variant: "error",
    },
  };
};

export const getUserNameOrEmail = (userData: UserData | undefined): string => {
  if (userData?.user.name) {
    return userData.user.name;
  } else if (userData?.user.email) {
    return userData.user.email;
  } else {
    return getMergedConfig().navigationDefaults.myNJAccountText;
  }
};

export const validateEmail = (email: string): boolean => {
  return !!/^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))$/.test(
    String(email).toLowerCase()
  );
};

export const flipObject = <T extends string | number | symbol>(obj: Record<string, T>): Record<T, string> => {
  return Object.keys(obj).reduce((acc, key) => {
    acc[obj[key]] = key;
    return acc;
  }, {} as Record<T, string>);
};

export const getPhoneNumberFormat = (phoneNumber: string): string => {
  const length = phoneNumber.length;
  if (length === 0) {
    return phoneNumber;
  }
  if (length < 4) {
    return `(${phoneNumber}`;
  }
  if (length < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

export const getFlow = (data: UserData | ProfileData): FlowType => {
  const persona: BusinessPersona = isUserData(data)
    ? getCurrentBusiness(data).profileData.businessPersona
    : data.businessPersona;

  return persona || "STARTING";
};

export function isUserData(data: UserData | ProfileData): data is UserData {
  return (data as UserData).user !== undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const flattenObject = (obj: any): any => {
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

export const mapMunicipalityDetailToMunicipality = (municipalityDetail: MunicipalityDetail): Municipality => {
  return {
    displayName: municipalityDetail.townDisplayName,
    id: municipalityDetail.id,
    name: municipalityDetail.townName,
    county: municipalityDetail.countyName,
  };
};

export const isForeignCorporation = (legalStructure: FormationLegalType): boolean => {
  return ["foreign-c-corporation", "foreign-s-corporation"].includes(legalStructure);
};

export const isForeignCorporationOrNonprofit = (legalStructure: FormationLegalType): boolean => {
  return ["foreign-c-corporation", "foreign-s-corporation", "foreign-nonprofit"].includes(legalStructure);
};

export const getConfigFieldByLegalStructure = (
  legalType: FormationLegalType
): "directors" | "trustees" | "members" => {
  switch (legalType) {
    case "c-corporation":
    case "s-corporation":
      return "directors";
    case "nonprofit":
      return "trustees";
    default:
      return "members";
  }
};

export const openInNewTab = (url: string): void => {
  window.open(url, "_blank", "noopener noreferrer");
};

export const removeMarkdownFormatting = (markdownText: string): string => {
  return (
    markdownText
      // Remove headers
      .replaceAll(/(^|\s)(#{1,6})\s/g, "$1")
      // Remove images
      .replaceAll(/!\[.*?]\(.*?\)/g, "")
      // Remove links
      .replaceAll(/\[.*?]\(.*?\)/g, "")
      // Remove strong and em tags
      .replaceAll(/(\*\*|__)(.*?)\1/g, "$2")
      .replaceAll(/(\*|_)(.*?)\1/g, "$2")
      // Remove inline code
      .replaceAll(/`{1,2}[^`]*`{1,2}/g, "")
      // Remove blockquotes
      .replaceAll(/^\s*>\s?/gm, "")
      // Remove unordered list bullets
      .replaceAll(/^\s*[*+-]\s/gm, "")
      // Remove ordered list numbers
      .replaceAll(/^\s*\d+\.\s/gm, "")
      // Remove horizontal rules
      .replaceAll(/^-{3,}\s*$/gm, "")
      // Remove extra lines
      .replaceAll(/\n{2,}/g, " ")
      // Remove all remaining line breaks
      .replaceAll(/(\r\n|\n|\r)/gm, "")
  );
};
