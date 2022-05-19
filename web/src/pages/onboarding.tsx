import { Alert } from "@/components/njwds-extended/Alert";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { getOnboardingFlows } from "@/components/onboarding/getOnboardingFlows";
import { OnboardingButtonGroup } from "@/components/onboarding/OnboardingButtonGroup";
import { PageSkeleton } from "@/components/PageSkeleton";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { AuthContext } from "@/contexts/authContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { RoadmapContext } from "@/contexts/roadmapContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import { loadUserDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import { ABStorageFactory } from "@/lib/storage/ABStorage";
import {
  createProfileFieldErrorMap,
  FlowType,
  LoadDisplayContent,
  OnboardingStatus,
  ProfileError,
  ProfileFieldErrorMap,
  ProfileFields,
  UserDisplayContent,
} from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { setAnalyticsDimensions, setRegistrationDimension } from "@/lib/utils/analytics-helpers";
import {
  getSectionCompletion,
  OnboardingErrorLookup,
  OnboardingStatusLookup,
  scrollToTop,
  templateEval,
} from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  BusinessUser,
  createEmptyProfileData,
  createEmptyUser,
  createEmptyUserData,
  LookupIndustryById,
  LookupLegalStructureById,
  Municipality,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { useMediaQuery } from "@mui/material";
import { GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { useRouter } from "next/router";
import React, {
  FormEvent,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CSSTransition } from "react-transition-group";

interface Props {
  displayContent: LoadDisplayContent;
  municipalities: Municipality[];
}

const OnboardingPage = (props: Props): ReactElement => {
  const { setRoadmap, setSectionCompletion } = useContext(RoadmapContext);
  const { state } = useContext(AuthContext);

  const router = useRouter();
  const [page, setPage] = useState<{ current: number; previous: number }>({ current: 1, previous: 1 });
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const [user, setUser] = useState<BusinessUser>(createEmptyUser(ABStorageFactory().getExperience()));
  const [error, setError] = useState<ProfileError | undefined>(undefined);
  const [alert, setAlert] = useState<OnboardingStatus | undefined>(undefined);
  const { userData, update } = useUserData();
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const headerRef = useRef<HTMLDivElement>(null);
  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());
  const [currentFlow, setCurrentFlow] = useState<FlowType>("STARTING");
  const [currentContent, setCurrentContent] = useState<UserDisplayContent>(
    props.displayContent[currentFlow] as UserDisplayContent
  );
  const hasHandledRouting = useRef<boolean>(false);

  const onValidation = useCallback(
    (field: ProfileFields, invalid: boolean): void => {
      setFieldStates({ ...fieldStates, [field]: { invalid } });
    },
    [setFieldStates, fieldStates]
  );

  const onboardingFlows = useMemo(() => {
    const onboardingFlows = getOnboardingFlows(profileData, user, onValidation, fieldStates);
    const requiresPublicFiling = LookupLegalStructureById(profileData.legalStructureId).requiresPublicFiling;
    if (!requiresPublicFiling) {
      onboardingFlows["OWNING"].pages.splice(1, 1);
    }
    return onboardingFlows;
  }, [profileData, user, onValidation, fieldStates]);

  const queryShallowPush = useCallback(
    (page: number) => router.push({ query: { page: page } }, undefined, { shallow: true }),
    [router]
  );

  useEffect(() => {
    setCurrentContent(props.displayContent[currentFlow] as UserDisplayContent);
  }, [currentFlow, props.displayContent]);

  useEffect(() => {
    const flow = profileData.hasExistingBusiness ? "OWNING" : "STARTING";
    setCurrentContent(props.displayContent[flow] as UserDisplayContent);
    setCurrentFlow(flow);
  }, [profileData.hasExistingBusiness, props.displayContent]);

  useEffect(() => {
    (async () => {
      if (
        !router.isReady ||
        hasHandledRouting.current ||
        !state.user ||
        state.isAuthenticated === IsAuthenticated.UNKNOWN
      )
        return;

      let currentUserData = userData;

      if (currentUserData) {
        setProfileData(currentUserData.profileData);
        setUser(currentUserData.user);
        const flow = currentUserData.profileData.hasExistingBusiness ? "OWNING" : "STARTING";
        setCurrentFlow(flow);
        setCurrentContent(props.displayContent[flow] as UserDisplayContent);
      } else if (state.isAuthenticated == IsAuthenticated.FALSE) {
        currentUserData = createEmptyUserData(state.user);
        setRegistrationDimension("Began Onboarding");
        await update(currentUserData);
        setProfileData(currentUserData.profileData);
        setUser(currentUserData.user);
      }

      if (currentUserData) {
        if (currentUserData?.formProgress === "COMPLETED") {
          await router.replace("/profile");
          return;
        } else {
          const queryPage = Number(router.query.page);
          const queryIndustryId = router.query.industry as string | undefined;

          if (industryQueryParamIsValid(queryIndustryId)) {
            await setIndustryAndRouteToPage2(currentUserData, queryIndustryId);
          } else if (pageQueryParamisValid(currentUserData, queryPage)) {
            setPage({ current: queryPage, previous: queryPage - 1 });
          } else {
            setPage({ current: 1, previous: 1 });
            queryShallowPush(1);
          }

          hasHandledRouting.current = true;
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, state.user, state.isAuthenticated]);

  const pageQueryParamisValid = (userData: UserData, page: number): boolean => {
    const hasAnsweredExistingBusiness = userData?.profileData.hasExistingBusiness !== undefined;
    const requestedPageIsInRange = page <= onboardingFlows[currentFlow].pages.length && page > 0;

    return hasAnsweredExistingBusiness && requestedPageIsInRange;
  };

  const industryQueryParamIsValid = (industryId: string | undefined): boolean => {
    return !!LookupIndustryById(industryId).id;
  };

  const setIndustryAndRouteToPage2 = async (
    userData: UserData,
    industryId: string | undefined
  ): Promise<void> => {
    setProfileData({
      ...profileData,
      hasExistingBusiness: false,
      initialOnboardingFlow: "STARTING",
      industryId: industryId,
    });
    setPage({ current: 2, previous: 1 });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const currentUserData = userData as UserData;

    const currentPageFlow = onboardingFlows[currentFlow].pages[page.current - 1];
    const errorMap = currentPageFlow.getErrorMap();
    if (errorMap) {
      if (errorMap.banner && errorMap.banner.some((error) => !error.valid)) {
        setError(errorMap.banner.find((error) => !error.valid)?.name);
        scrollToTop();
        headerRef.current?.focus();
        return;
      } else if (errorMap.inline && errorMap.inline.some((error) => !error.valid)) {
        setAlert("ERROR");
        onValidation(errorMap.inline.find((error) => !error.valid)?.name as ProfileFields, true);
        scrollToTop();
        headerRef.current?.focus();
        return;
      }
    }

    let newProfileData = profileData;

    const hasExistingBusinessChanged =
      profileData.hasExistingBusiness !== currentUserData.profileData.hasExistingBusiness;

    if (page.current === 1 && hasExistingBusinessChanged) {
      let initialOnboardingFlow = profileData.initialOnboardingFlow;
      if (currentUserData.formProgress !== "COMPLETED") {
        initialOnboardingFlow = profileData.hasExistingBusiness ? "OWNING" : "STARTING";
      }

      newProfileData = {
        initialOnboardingFlow: initialOnboardingFlow,
        businessName: profileData.businessName,
        industryId: profileData.hasExistingBusiness === true ? "generic" : undefined,
        homeBasedBusiness: profileData.homeBasedBusiness,
        liquorLicense: profileData.liquorLicense,
        requiresCpa: profileData.requiresCpa,
        municipality: profileData.municipality,
        hasExistingBusiness: profileData.hasExistingBusiness,
        legalStructureId: profileData.legalStructureId,
        cannabisLicenseType: undefined,
        cannabisMicrobusiness: undefined,
        dateOfFormation: undefined,
        entityId: undefined,
        constructionRenovationPlan: undefined,
        employerId: undefined,
        taxId: undefined,
        notes: "",
        ownershipTypeIds: [],
        documents: { formationDoc: "", standingDoc: "", certifiedDoc: "" },
        existingEmployees: undefined,
        taxPin: undefined,
        sectorId: undefined,
        naicsCode: "",
      };

      setProfileData(newProfileData);
      setCurrentFlow(profileData.hasExistingBusiness ? "OWNING" : "STARTING");
    }

    setAnalyticsDimensions(newProfileData);
    setAlert(undefined);
    setError(undefined);

    const newRoadmap = await buildUserRoadmap(profileData);
    setRoadmap(newRoadmap);
    setSectionCompletion(getSectionCompletion(newRoadmap, currentUserData));

    if (page.current + 1 <= onboardingFlows[currentFlow].pages.length) {
      update({ ...currentUserData, user, profileData: newProfileData }, { local: true }).then(() => {
        const nextCurrentPage = page.current + 1;
        setPage({
          current: nextCurrentPage,
          previous: page.current,
        });
        queryShallowPush(nextCurrentPage);
        headerRef.current?.focus();
      });
    } else {
      setRegistrationDimension("Onboarded Guest");
      analytics.event.onboarding_last_step.submit.finish_onboarding();
      let newUserData: UserData = {
        ...currentUserData,
        user,
        profileData: newProfileData,
        formProgress: "COMPLETED",
      };

      if (newUserData.user.receiveNewsletter) {
        newUserData = await api.postNewsletter(newUserData);
      }

      if (newUserData.user.userTesting) {
        newUserData = await api.postUserTesting(newUserData);
      }

      newUserData = await api.postGetAnnualFilings(newUserData);

      await update(newUserData);
      await router.push(newUserData.profileData.hasExistingBusiness ? "/dashboard" : "/roadmap");
    }
  };

  const onBack = () => {
    if (page.current + 1 > 0) {
      setAlert(undefined);
      setError(undefined);
      const previousPage = page.current - 1;
      setPage({
        current: previousPage,
        previous: page.current,
      });
      queryShallowPush(previousPage);
      headerRef.current?.focus();
    }
  };

  const evalHeaderStepsTemplate = (): string => {
    if (page.current === 1) {
      return templateEval(Config.onboardingDefaults.stepOneTemplate, {
        currentPage: page.current.toString(),
      });
    } else {
      return templateEval(Config.onboardingDefaults.stepXofYTemplate, {
        currentPage: page.current.toString(),
        totalPages: onboardingFlows[currentFlow].pages.length.toString(),
      });
    }
  };

  const header = () => (
    <div className="margin-y-2 desktop:margin-y-0 desktop:padding-bottom-4">
      <h1 ref={headerRef}>
        {Config.onboardingDefaults.pageTitle}{" "}
        <span className="text-light" data-testid={`step-${page.current.toString()}`}>
          {evalHeaderStepsTemplate()}
        </span>
      </h1>
    </div>
  );

  const getAnimation = (): string => {
    return page.previous < page.current ? "slide" : "slide-back";
  };

  const getTimeout = (slidePage: number): number => {
    return slidePage === page.previous ? 100 : 300;
  };

  const redirectUrl = useMemo(
    () => (userData?.profileData.hasExistingBusiness ? "/dashboard" : "/roadmap"),
    [userData?.profileData.hasExistingBusiness]
  );

  return (
    <ProfileDataContext.Provider
      value={{
        state: {
          page: page.current,
          profileData: profileData,
          user: user,
          flow: currentFlow,
          displayContent: currentContent,
          municipalities: props.municipalities,
        },
        setProfileData,
        setUser,
        onBack,
      }}
    >
      <NextSeo
        title={`Business.NJ.gov Navigator - ${
          Config.onboardingDefaults.pageTitle
        } ${evalHeaderStepsTemplate()} `}
      />
      <PageSkeleton>
        <main className="usa-section padding-top-0 desktop:padding-top-8" id="main">
          <SingleColumnContainer>
            {header()}
            {!isLargeScreen && <hr />}
            {error && (
              <Alert dataTestid={`error-alert-${error}`} variant="error">
                {OnboardingErrorLookup[error]}
              </Alert>
            )}
            {alert && (
              <ToastAlert
                variant={OnboardingStatusLookup[alert].variant}
                isOpen={alert !== undefined}
                close={() => setAlert(undefined)}
                dataTestid={`toast-alert-${alert}`}
                heading={OnboardingStatusLookup[alert].header}
              >
                <>
                  {OnboardingStatusLookup[alert].body}
                  {OnboardingStatusLookup[alert] && (
                    <Link href={redirectUrl}>
                      <a href={redirectUrl} data-testid={`toast-link`}>
                        {OnboardingStatusLookup[alert].link}
                      </a>
                    </Link>
                  )}
                </>
              </ToastAlert>
            )}

            <UserDataErrorAlert />
          </SingleColumnContainer>
          <div className="slide-container">
            {onboardingFlows[currentFlow].pages.map((onboardingPage, index) => (
              <CSSTransition
                key={index}
                in={page.current === index + 1}
                unmountOnExit
                timeout={getTimeout(index + 1)}
                classNames={`width-100 ${getAnimation()}`}
              >
                <SingleColumnContainer>
                  <form
                    onSubmit={onSubmit}
                    className={`usa-prose onboarding-form margin-top-2`}
                    data-testid={`page-${index + 1}-form`}
                  >
                    {onboardingPage.component}
                    <hr className="margin-top-6 margin-bottom-4" aria-hidden={true} />
                    <OnboardingButtonGroup
                      isFinal={page.current === onboardingFlows[currentFlow].pages.length}
                    />
                  </form>
                </SingleColumnContainer>
              </CSSTransition>
            ))}
          </div>
        </main>
      </PageSkeleton>
    </ProfileDataContext.Provider>
  );
};

export const getStaticProps = async (): Promise<GetStaticPropsResult<Props>> => {
  const municipalities = await loadAllMunicipalities();

  return {
    props: {
      displayContent: loadUserDisplayContent(),
      municipalities,
    },
  };
};

export default OnboardingPage;
