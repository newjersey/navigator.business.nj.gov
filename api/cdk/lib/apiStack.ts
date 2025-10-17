import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { applyStandardTags } from "./stackUtils";
import { IFunction } from "aws-cdk-lib/aws-lambda";

interface LambdaConfig {
  lambda: IFunction;
  prefix?: string;
  nestedPrefix?: string;
}

interface ApiStackProps extends StackProps {
  stage: string;
  lambdas: Record<string, LambdaConfig>;
}

export class ApiStack extends Stack {
  public readonly restApi: apigateway.IRestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    console.log("stage:", props.stage);

    if (props.stage === "local") {
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

      this.restApi.root.addMethod(
        "GET",
        new apigateway.MockIntegration({
          integrationResponses: [
            {
              statusCode: "200",
              responseTemplates: {
                "application/json": JSON.stringify({ message: "Local API working" }),
              },
            },
          ],
          passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        }),
        {
          methodResponses: [{ statusCode: "200" }],
        },
      );
    } else {
      console.log("stage:", props.stage);
      const restApiId = process.env.API_GATEWAY_ID;
      const restApiRootResourceId = process.env.API_GATEWAY_ROOT_RESOURCE_ID;

      if (!restApiId || !restApiRootResourceId) {
        throw new Error(`Missing RestApiId or RootResourceId in for stage "${props.stage}"`);
      }
      this.restApi = apigateway.RestApi.fromRestApiAttributes(this, "ImportedRestApi", {
        restApiId: restApiId!,
        rootResourceId: restApiRootResourceId!,
      });
    }

    for (const { lambda, prefix, nestedPrefix } of Object.values(props.lambdas)) {
      if (!lambda) continue;
      let resource = prefix ? this.restApi.root.addResource(prefix) : this.restApi.root;
      resource = nestedPrefix ? resource.addResource(nestedPrefix) : resource;
      resource.addProxy({
        defaultIntegration: new apigateway.LambdaIntegration(lambda),
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
