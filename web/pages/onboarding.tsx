import React, { ReactElement, useEffect, useState } from "react";
import { PageSkeleton } from "../components/PageSkeleton";
import Form, { ISubmitEvent } from "@rjsf/core";
import schema from "../schemas/form.json";
import jsonUiSchema from "../schemas/form-ui.json";
import { useRouter } from "next/router";
import { JSONSchema7 } from "json-schema";
import { onKeyPress } from "../lib/helpers";
import { BusinessForm } from "../lib/types/form";
import { useUserData } from "../lib/data/useUserData";
import { SinglePageLayout } from "../components/njwds-extended/SinglePageLayout";

const Onboarding = (): ReactElement => {
  const router = useRouter();
  const sections = Object.keys(schema.properties);
  const [page, setPage] = useState<number>(0);
  const { userData, update } = useUserData();

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const [uiSchema, setUiSchema] = useState<any>(jsonUiSchema);

  const setActivePage = () => {
    const newUiSchema = { ...uiSchema };
    for (const section in sections) {
      newUiSchema[sections[section]] = {
        ...newUiSchema[sections[section]],
        classNames: "",
      };
    }

    newUiSchema[sections[page]] = {
      ...newUiSchema[sections[page]],
      classNames: "active",
    };

    setUiSchema(newUiSchema);
  };

  useEffect(() => {
    setActivePage();
  }, [page]);

  const onSubmit = (event: ISubmitEvent<BusinessForm>): void => {
    if (!userData) return;
    if (page + 1 < sections.length) {
      setPage(page + 1);
      update({
        ...userData,
        formData: event.formData,
      });
    } else {
      update({
        ...userData,
        formData: event.formData,
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

  if (!userData) {
    return <></>;
  }

  return (
    <PageSkeleton>
      <SinglePageLayout>
        <h1>The onboarding form</h1>
        <Form
          schema={schema as JSONSchema7}
          className={`page-${page}`}
          onSubmit={onSubmit}
          formData={userData.formData}
          uiSchema={uiSchema}
        >
          {page > 0 && (
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
          <button type="submit" className="usa-button">
            Next
          </button>
        </Form>
      </SinglePageLayout>
    </PageSkeleton>
  );
};

export default Onboarding;
