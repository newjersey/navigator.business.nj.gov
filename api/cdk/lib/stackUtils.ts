import * as cdk from "aws-cdk-lib";
import { IConstruct } from "constructs";

/**
 * Apply standard tags to a given resource.
 */
export const applyStandardTags = (resource: IConstruct, stage: string): void => {
  cdk.Tags.of(resource).add("STAGE", stage);
};
