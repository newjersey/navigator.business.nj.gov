import React, { ChangeEvent, FormEvent, ReactElement, useEffect, useState } from "react";
import { PageSkeleton } from "../components/PageSkeleton";
import { useRouter } from "next/router";
import { onKeyPress } from "../lib/helpers";
import { useUserData } from "../lib/data/useUserData";
import { SinglePageLayout } from "../components/njwds-extended/SinglePageLayout";
import { createEmptyOnboardingData, Industry, LegalStructure, OnboardingData } from "../lib/types/types";
import { createStyles, FormControl, makeStyles, MenuItem, Select, TextField } from "@material-ui/core";

const useStyles = makeStyles(() =>
  createStyles({
    formControl: {
      minWidth: "20rem",
    },
  })
);

const Onboarding = (): ReactElement => {
  const PAGES = 3;
  const classes = useStyles();
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const { userData, update } = useUserData();
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(createEmptyOnboardingData());

  const handleBusinessName = (event: ChangeEvent<HTMLInputElement>): void => {
    setOnboardingData({
      ...onboardingData,
      businessName: event.target.value,
    });
  };

  const handleIndustry = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    let industry: Industry = "generic";
    if (event.target.value) {
      industry = event.target.value as Industry;
    }
    setOnboardingData({
      ...onboardingData,
      industry,
    });
  };

  const handleLegalStructure = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setOnboardingData({
      ...onboardingData,
      legalStructure: (event.target.value as LegalStructure) || undefined,
    });
  };

  useEffect(() => {
    if (userData) {
      setOnboardingData(userData.onboardingData);
    }
  }, [userData]);

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!userData) return;
    if (page + 1 <= PAGES) {
      update({
        ...userData,
        onboardingData,
      });
      setPage(page + 1);
    } else {
      update({
        ...userData,
        onboardingData,
        formProgress: "COMPLETED",
      });
      router.push("/roadmap");
    }
  };

  const onBack = () => {
    if (page + 1 > 0) {
      setPage(page - 1);
    }
  };

  const ButtonGroup = (): ReactElement => (
    <div className="float-right">
      {page > 1 && (
        <div
          tabIndex={0}
          role="button"
          className="usa-button usa-button--outline"
          onClick={onBack}
          onKeyPress={(e: React.KeyboardEvent): void => {
            onKeyPress(e, onBack);
          }}
        >
          Back
        </div>
      )}
      <button type="submit" className="usa-button margin-right-0">
        Next
      </button>
    </div>
  );

  const isActiveClass = (pageNumber: number): string => {
    return pageNumber === page ? "active" : "";
  };

  if (!userData) {
    return <></>;
  }

  return (
    <PageSkeleton>
      <SinglePageLayout>
        <h2>
          Onboarding{" "}
          <span className="weight-400">
            Step {page} of {PAGES}
          </span>
        </h2>
        <div className={`padding-top-2 usa-prose page ${isActiveClass(1)}`}>
          <h3>Hi Joe! Let’s get your business started.</h3>
          <p className="usa-intro">
            So you're considering opening up a business, how exciting! We're thrilled to be here and make this
            process as seamless as possible. Please fill out the following questions so we can provide you
            with your unique business registration roadmap. This roadmap will guide you through the business
            registration process. At the end of this process you should have registered your business with the
            state, obtained an EIN with the federal government and applied for potential municipal and state
            licenses.
          </p>
          <form onSubmit={onSubmit}>
            <h3>Business Name</h3>
            <p>
              Have you thought of a name for your business? If you had a name in mind, first we'll need to
              check if that name is available.
            </p>
            <div className="form-input">
              <TextField
                value={onboardingData.businessName}
                onChange={handleBusinessName}
                variant="outlined"
                size="small"
                fullWidth
                inputProps={{
                  "aria-label": "Business name",
                }}
              />
            </div>
            <hr className="margin-top-6 margin-bottom-4 bg-base-lighter" />
            {ButtonGroup()}
          </form>
        </div>
        <div className={`page ${isActiveClass(2)}`}>
          <form onSubmit={onSubmit}>
            <h3>Business Industry</h3>
            <p>Which business industry can best describe your company?</p>
            <div className="form-input">
              <FormControl variant="outlined" className={classes.formControl}>
                <Select
                  fullWidth
                  value={onboardingData.industry || "generic"}
                  onChange={handleIndustry}
                  inputProps={{
                    "aria-label": "Industry",
                    "data-testid": "industry",
                  }}
                >
                  <MenuItem value="generic">&nbsp;</MenuItem>
                  <MenuItem value="restaurant">Restaurant</MenuItem>
                  <MenuItem value="home-contractor">Home-Improvement Contractor</MenuItem>
                  <MenuItem value="e-commerce">E-Commerce</MenuItem>
                  <MenuItem value="cosmetology">Cosmetology</MenuItem>
                </Select>
              </FormControl>
            </div>
            <hr className="margin-top-6 margin-bottom-4 bg-base-lighter" />
            {ButtonGroup()}
          </form>
        </div>
        <div className={`page ${isActiveClass(3)}`}>
          <form onSubmit={onSubmit}>
            <h3>Legal Structure</h3>
            <p>Which legal structure can best describe your company?</p>
            <div className="form-input">
              <FormControl variant="outlined" className={classes.formControl}>
                <Select
                  fullWidth
                  value={onboardingData.legalStructure || ""}
                  onChange={handleLegalStructure}
                  inputProps={{
                    "aria-label": "Legal structure",
                    "data-testid": "legal-structure",
                  }}
                >
                  <MenuItem value="">&nbsp;</MenuItem>
                  <MenuItem value="Sole Proprietorship">Sole Proprietorship</MenuItem>
                  <MenuItem value="General Partnership">General Partnership</MenuItem>
                  <MenuItem value="Limited Partnership (LP)">Limited Partnership (LP)</MenuItem>
                  <MenuItem value="Limited Liability Partnership (LLP)">
                    Limited Liability Partnership (LLP)
                  </MenuItem>
                  <MenuItem value="Limited Liability Company (LLC)">Limited Liability Company (LLC)</MenuItem>
                  <MenuItem value="C-Corporation">C-Corporation</MenuItem>
                  <MenuItem value="S-Corporation">S-Corporation</MenuItem>
                  <MenuItem value="B-Corporation">B-Corporation</MenuItem>
                </Select>
              </FormControl>
            </div>
            <hr className="margin-top-6 margin-bottom-4 bg-base-lighter" />
            {ButtonGroup()}
          </form>
        </div>
      </SinglePageLayout>
    </PageSkeleton>
  );
};

export default Onboarding;
