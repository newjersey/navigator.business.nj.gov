import { Stack, StackProps } from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";
import { STATIC_SITE_CLUSTER_NAME, STATIC_SITE_SHARED_RESOURCE_TAG } from "./constants";
import { applyStandardTags } from "./stackUtils";

/** CDK stack that owns the shared static-site ECS cluster for one AWS account. */
export class StaticSiteClusterStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const cluster = new ecs.CfnCluster(this, "StaticSiteCluster", {
      clusterName: STATIC_SITE_CLUSTER_NAME,
      clusterSettings: [
        {
          name: "containerInsights",
          value: "enabled",
        },
      ],
    });

    applyStandardTags(cluster, STATIC_SITE_SHARED_RESOURCE_TAG);
  }
}
