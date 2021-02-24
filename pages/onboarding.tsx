import React, { ReactElement, useContext, useEffect, useState } from "react";
import { PageSkeleton } from "../components/PageSkeleton";
import { Layout } from "../components/Layout";
import Form, { ISubmitEvent } from "@rjsf/core";
import schema from "../schemas/form.json";
import jsonUiSchema from "../schemas/form-ui.json";
import { useRouter } from "next/router";
import { JSONSchema7 } from "json-schema";
import { onKeyPress } from "../lib/helpers";
import { FormContext } from "./_app";
import { BusinessForm } from "../lib/types/form";

const Onboarding = (): ReactElement => {
  const router = useRouter();
  const sections = Object.keys(schema.properties);
  const [page, setPage] = useState<number>(0);
  const { formData, setFormData } = useContext(FormContext);

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
    setFormData(event.formData);
    if (page + 1 < sections.length) {
      setPage(page + 1);
    } else {
      router.push(`/roadmaps/${event.formData.businessType.businessType}`);
    }
  };

  const onBack = () => {
    if (page + 1 > 0) {
      setPage(page - 1);
    }
  };

  return (
    <PageSkeleton>
      <Layout>
        <h1>The onboarding form</h1>
        <Form
          schema={schema as JSONSchema7}
          className={`page-${page}`}
          onSubmit={onSubmit}
          formData={formData}
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
      </Layout>
    </PageSkeleton>
  );
};

export default Onboarding;
