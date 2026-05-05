import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { Construct } from "constructs";
import { PROD_STAGE, STATIC_SITE_SERVICE_BASE_NAME } from "./constants";
import { applyStandardTags } from "./stackUtils";

/** Properties for creating the per-stage static-site ECR repository stack. */
export interface StaticSiteRepositoryStackProps extends StackProps {
  /** Deployment stage that owns this repository, such as dev, testing, content, staging, or prod. */
  readonly stage: string;
}

/** CDK stack that owns the static-site ECR repository and image lifecycle policy. */
export class StaticSiteRepositoryStack extends Stack {
  /** Private ECR repository that stores static-site images for this stage. */
  public readonly repository: ecr.Repository;

  constructor(scope: Construct, id: string, props: StaticSiteRepositoryStackProps) {
    super(scope, id, props);

    const repository = new ecr.Repository(this, "StaticSiteRepository", {
      repositoryName: `${STATIC_SITE_SERVICE_BASE_NAME}-${props.stage}`,
      imageScanOnPush: true,
      removalPolicy: RemovalPolicy.RETAIN,
      emptyOnDelete: false,
    });

    repository.addLifecycleRule({
      description: "Expire untagged images after seven days.",
      tagStatus: ecr.TagStatus.UNTAGGED,
      maxImageAge: Duration.days(7),
    });

    repository.addLifecycleRule({
      description: "Keep the latest tagged static-site images.",
      tagStatus: ecr.TagStatus.TAGGED,
      tagPatternList: ["*"],
      maxImageCount: props.stage === PROD_STAGE ? 20 : 50,
    });

    applyStandardTags(repository, props.stage);

    new CfnOutput(this, "StaticSiteRepositoryUri", {
      value: repository.repositoryUri,
      exportName: `${STATIC_SITE_SERVICE_BASE_NAME}-${props.stage}-repository-uri`,
    });

    this.repository = repository;
  }
}
