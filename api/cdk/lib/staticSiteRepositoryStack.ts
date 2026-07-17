import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { Construct } from "constructs";
import { STATIC_SITE_SERVICE_BASE_NAME, STATIC_SITE_SHARED_RESOURCE_TAG } from "./constants";
import { applyStandardTags } from "./stackUtils";

/**
 * Number of tagged static-site images retained in the shared ECR repository.
 *
 * The shared repository carries dev, content, testing, staging, and production tags, so the policy
 * keeps enough history for lower-environment SHA tags, the independent static-site pipeline's
 * date-SHA tags, and production point-release tags.
 */
const STATIC_SITE_TAGGED_IMAGE_RETENTION_COUNT = 100;

/** CDK stack that owns the static-site ECR repository and image lifecycle policy. */
export class StaticSiteRepositoryStack extends Stack {
  /** Private ECR repository that stores static-site images for every stage in this AWS account. */
  public readonly repository: ecr.Repository;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const repository = new ecr.Repository(this, "StaticSiteRepository", {
      repositoryName: STATIC_SITE_SERVICE_BASE_NAME,
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
      maxImageCount: STATIC_SITE_TAGGED_IMAGE_RETENTION_COUNT,
    });

    applyStandardTags(repository, STATIC_SITE_SHARED_RESOURCE_TAG);

    this.repository = repository;
  }
}
