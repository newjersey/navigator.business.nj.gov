import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { applyStandardTags } from "./stackUtils";
import { IFunction } from "aws-cdk-lib/aws-lambda";

interface ApiStackProps extends StackProps {
  stage: string;
  githubOauth2Lambda: IFunction;
}

export class ApiStack extends Stack {
  public readonly restApi: apigateway.IRestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const restApiId = process.env.API_GATEWAY_ID!;
    const restApiRootResourceId = process.env.API_GATEWAY_ROOT_RESOURCE_ID!;

    if (!process.env.CI && props.stage === "local" && props.githubOauth2Lambda) {
      this.restApi = new apigateway.RestApi(this, "ApiGatewayRestApi", {
        restApiName: `LocalApi-${props.stage}`,
        description: "Local API for testing purposes",
      });

      applyStandardTags(this.restApi, props.stage);
      // Default 4XX response
      new apigateway.CfnGatewayResponse(this, "GatewayResponseDefault4XX", {
        responseType: "DEFAULT_4XX",
        restApiId: this.restApi.restApiId,
        responseParameters: {
          "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
          "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
        },
      });

      // Default 5XX response
      new apigateway.CfnGatewayResponse(this, "GatewayResponseDefault5XX", {
        responseType: "DEFAULT_5XX",
        restApiId: this.restApi.restApiId,
        responseParameters: {
          "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
          "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
        },
      });
    } else {
      if (!restApiId || !restApiRootResourceId) {
        throw new Error(`Missing RestApiId or RootResourceId in SSM for stage "${props.stage}"`);
      }
      this.restApi = apigateway.RestApi.fromRestApiAttributes(this, "ImportedRestApi", {
        restApiId: restApiId!,
        rootResourceId: restApiRootResourceId!,
      });
    }

    if (props.githubOauth2Lambda) {
      const githubOauth2Integration = new apigateway.LambdaIntegration(props.githubOauth2Lambda);

      const apiResource = this.restApi.root.addResource("api");
      const cmsResource = apiResource.addResource("cms");

      // /api/cms/{proxy+}
      cmsResource.addProxy({
        defaultIntegration: githubOauth2Integration,
        anyMethod: true,
        defaultCorsPreflightOptions: {
          allowOrigins: apigateway.Cors.ALL_ORIGINS,
          allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
          allowMethods: apigateway.Cors.ALL_METHODS,
        },
      });
    }
  }
}
