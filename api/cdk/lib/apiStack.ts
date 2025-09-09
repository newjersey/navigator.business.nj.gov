import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import apigateway from "aws-cdk-lib/aws-apigateway";
import { applyStandardTags } from "./stackUtils.js";

interface ApiStackProps extends StackProps {
  stage: string;
  restApiId?: string;
  restApiRootResourceId?: string;
}

export class ApiStack extends Stack {
  public readonly restApi: apigateway.IRestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    if (!process.env.CI && props.stage === "local") {
      this.restApi = new apigateway.RestApi(this, "ApiGatewayRestApi", {});

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
      this.restApi = apigateway.RestApi.fromRestApiAttributes(this, "ImportedRestApi", {
        restApiId: props.restApiId!,
        rootResourceId: props.restApiRootResourceId!,
      });
    }
  }
}
