import { Duration } from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import {
  CONTENT_STAGE,
  DEV_STAGE,
  PROD_STAGE,
  STATIC_SITE_CONTAINER_NAME,
  STATIC_SITE_CONTAINER_PORT,
  STATIC_SITE_SERVICE_BASE_NAME,
  STAGING_STAGE,
  TESTING_STAGE,
} from "./constants";
import { applyStandardTags } from "./stackUtils";

/** Inputs for creating the static-site ECS task definition and IAM roles. */
export interface CreateStaticSiteTaskDefinitionProps {
  /** Construct scope that owns the task definition and task IAM roles. */
  readonly scope: Construct;

  /** Deployment stage used in names and tags. */
  readonly stage: string;

  /** ECR repository that contains the static-site image. */
  readonly repository: ecr.IRepository;

  /** Immutable ECR image tag that this task definition revision should run. */
  readonly imageTag: string;

  /** CloudWatch log group that receives container logs. */
  readonly logGroup: logs.ILogGroup;
}

/**
 * Fargate CPU units for the static-site task.
 *
 * This is half of the existing Next.js application task size and matches AWS's smallest practical
 * size for a lightweight standalone Next.js server.
 */
const STATIC_SITE_CPU_UNITS = 512;

/**
 * Fargate memory limit for the static-site task.
 *
 * This is half of the existing Next.js application memory allocation and pairs with 512 CPU units
 * as a supported Fargate size.
 */
const STATIC_SITE_MEMORY_MIB = 1024;

/**
 * Container health-check timeout.
 *
 * Two seconds is shorter than the ECS health-check timeout so the Node process exits before ECS
 * marks the check itself as timed out.
 */
const STATIC_SITE_HEALTH_CHECK_TIMEOUT_MS = 2000;

/**
 * Stages where the public static-site origin should require Basic Auth.
 *
 * These pre-launch protected stages are reached through external WAF routing, while local
 * development is intentionally unaffected.
 */
const STATIC_SITE_BASIC_AUTH_STAGES = new Set([
  DEV_STAGE,
  CONTENT_STAGE,
  TESTING_STAGE,
  STAGING_STAGE,
  PROD_STAGE,
]);

/** Inputs for creating runtime environment variables injected into the static-site ECS container. */
export interface StaticSiteContainerEnvironmentProps {
  /** Deployment stage that determines whether Basic Auth should be enabled. Expected values are the known CDK stages. */
  readonly stage: string;
}

/** Basic Auth credential variables supplied by GitHub Actions during CDK deployment. */
interface StaticSiteBasicAuthEnvironment {
  /** Username injected into the ECS task for protected-stage Basic Auth. */
  readonly username: string;

  /** Password injected into the ECS task for protected-stage Basic Auth. */
  readonly password: string;
}

/** Create the consistent per-stage ECS service and task-definition family name. */
export const createStaticSiteServiceName = (stage: string): string => {
  return `${STATIC_SITE_SERVICE_BASE_NAME}-${stage}`;
};

const isStaticSiteBasicAuthStage = (stage: string): boolean => {
  return STATIC_SITE_BASIC_AUTH_STAGES.has(stage);
};

/**
 * Reads a GitHub Actions-provided environment variable required for protected-stage Basic Auth.
 */
const readRequiredEnvironmentValue = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required to deploy Basic Auth for the static-site ECS service.`);
  }

  return value;
};

/**
 * Reads Basic Auth credentials from the deployment environment.
 */
const readStaticSiteBasicAuthEnvironment = (): StaticSiteBasicAuthEnvironment => {
  return {
    username: readRequiredEnvironmentValue("BASIC_AUTH_USERNAME"),
    password: readRequiredEnvironmentValue("BASIC_AUTH_PASSWORD"),
  };
};

/**
 * Creates the ECS container environment while enabling Basic Auth for pre-launch protected stages.
 */
const createStaticSiteContainerEnvironment = (
  props: StaticSiteContainerEnvironmentProps,
): Record<string, string> => {
  const baseEnvironment = {
    HOSTNAME: "0.0.0.0",
    NODE_ENV: "production",
    PORT: STATIC_SITE_CONTAINER_PORT.toString(),
  };

  if (!isStaticSiteBasicAuthStage(props.stage)) {
    return {
      ...baseEnvironment,
      USE_BASIC_AUTH: "false",
    };
  }

  const basicAuthEnvironment = readStaticSiteBasicAuthEnvironment();

  return {
    ...baseEnvironment,
    USE_BASIC_AUTH: "true",
    BASIC_AUTH_USERNAME: basicAuthEnvironment.username,
    BASIC_AUTH_PASSWORD: basicAuthEnvironment.password,
  };
};

const createStaticSiteHealthCheckScript = (): string => {
  return `const http=require('node:http');const request=http.get('http://127.0.0.1:3000/healthz',(response)=>{process.exit(response.statusCode===200?0:1)});request.on('error',()=>process.exit(1));request.setTimeout(${STATIC_SITE_HEALTH_CHECK_TIMEOUT_MS},()=>{request.destroy();process.exit(1)})`;
};

const createStaticSiteHealthCheckCommand = (): string => {
  return ["node", "-e", JSON.stringify(createStaticSiteHealthCheckScript())].join(" ");
};

/** Create the Fargate task definition and IAM roles for the static-site container. */
export const createStaticSiteTaskDefinition = (
  props: CreateStaticSiteTaskDefinitionProps,
): ecs.FargateTaskDefinition => {
  const taskExecutionRole = new iam.Role(props.scope, "StaticSiteTaskExecutionRole", {
    roleName: `${STATIC_SITE_SERVICE_BASE_NAME}-${props.stage}-execution-role`,
    assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    managedPolicies: [
      iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonECSTaskExecutionRolePolicy"),
    ],
  });
  const taskRole = new iam.Role(props.scope, "StaticSiteTaskRole", {
    roleName: `${STATIC_SITE_SERVICE_BASE_NAME}-${props.stage}-task-role`,
    assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
  });
  const taskDefinition = new ecs.FargateTaskDefinition(props.scope, "StaticSiteTaskDefinition", {
    family: createStaticSiteServiceName(props.stage),
    cpu: STATIC_SITE_CPU_UNITS,
    memoryLimitMiB: STATIC_SITE_MEMORY_MIB,
    executionRole: taskExecutionRole,
    taskRole,
  });

  taskDefinition.addContainer("StaticSiteContainer", {
    containerName: STATIC_SITE_CONTAINER_NAME,
    image: ecs.ContainerImage.fromEcrRepository(props.repository, props.imageTag),
    essential: true,
    environment: createStaticSiteContainerEnvironment({ stage: props.stage }),
    healthCheck: {
      command: ["CMD-SHELL", createStaticSiteHealthCheckCommand()],
      interval: Duration.seconds(30),
      timeout: Duration.seconds(3),
      retries: 3,
    },
    logging: ecs.LogDrivers.awsLogs({
      logGroup: props.logGroup,
      streamPrefix: STATIC_SITE_CONTAINER_NAME,
    }),
    portMappings: [
      {
        containerPort: STATIC_SITE_CONTAINER_PORT,
        hostPort: STATIC_SITE_CONTAINER_PORT,
        protocol: ecs.Protocol.TCP,
      },
    ],
  });

  applyStandardTags(taskExecutionRole, props.stage);
  applyStandardTags(taskRole, props.stage);
  applyStandardTags(taskDefinition, props.stage);
  return taskDefinition;
};
