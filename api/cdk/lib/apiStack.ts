import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { applyStandardTags, attachLambdaToResource } from "./stackUtils";
import { IFunction } from "aws-cdk-lib/aws-lambda";

interface LambdaConfig {
  lambda: IFunction;
}

interface ApiStackProps extends StackProps {
  stage: string;
  lambdas: Record<string, LambdaConfig>;
}

export class ApiStack extends Stack {
  public readonly restApi: apigateway.IRestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

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
      const restApiId = process.env.API_GATEWAY_ID!;
      const restApiRootResourceId = process.env.API_GATEWAY_ROOT_RESOURCE_ID;

      if (!restApiId || !restApiRootResourceId) {
        throw new Error(`Missing RestApiId or RootResourceId in for stage "${props.stage}"`);
      }
      this.restApi = apigateway.RestApi.fromRestApiAttributes(this, "ImportedRestApi", {
        restApiId: restApiId!,
        rootResourceId: restApiRootResourceId!,
      });
    }

    new apigateway.CfnGatewayResponse(this, "Global4xxCorsResponse", {
      restApiId: this.restApi.restApiId,
      responseType: "DEFAULT_4XX",
      responseParameters: {
        "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
        "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
        "gatewayresponse.header.Access-Control-Allow-Methods": "'*'",
      },
    });

    new apigateway.CfnGatewayResponse(this, "Global5xxCorsResponse", {
      restApiId: this.restApi.restApiId,
      responseType: "DEFAULT_5XX",
      responseParameters: {
        "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
        "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
        "gatewayresponse.header.Access-Control-Allow-Methods": "'*'",
      },
    });

    new apigateway.CfnGatewayResponse(this, "UnauthorizedCorsResponse", {
      restApiId: this.restApi.restApiId,
      responseType: "UNAUTHORIZED",
      responseParameters: {
        "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
        "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
        "gatewayresponse.header.Access-Control-Allow-Methods": "'*'",
      },
    });

    const expressLambda = props.lambdas.express?.lambda;
    const githubLambda = props.lambdas.githubOauth2?.lambda;

    const cognitoUserPoolId = process.env.COGNITO_USER_POOL_ID!;
    const cognitoArn = cognitoUserPoolId
      ? `arn:aws:cognito-idp:${Stack.of(this).region}:${Stack.of(this).account}:userpool/${cognitoUserPoolId}`
      : undefined;

    if (expressLambda) {
      // Root, health
      attachLambdaToResource(this, this.restApi.root, expressLambda, cognitoArn);

      const health = this.restApi.root.getResource("health");
      if (health) attachLambdaToResource(this, health, expressLambda, cognitoArn);

      const api = this.restApi.root.getResource("api");
      if (api) {
        for (const resource of ["external", "guest", "mgmt", "self-reg"]) {
          const subResource = api.getResource(resource);
          if (subResource) attachLambdaToResource(this, subResource, expressLambda, cognitoArn);
        }

        const usersResource = api.getResource("users");
        if (usersResource) {
          const emailCheckResource = usersResource.getResource("emailCheck");
          if (emailCheckResource)
            attachLambdaToResource(this, emailCheckResource, expressLambda, cognitoArn);
        }

        const cmsResource = api.getResource("cms");
        if (cmsResource && githubLambda)
          attachLambdaToResource(this, cmsResource, githubLambda, cognitoArn);
      }
    }
  }
}
