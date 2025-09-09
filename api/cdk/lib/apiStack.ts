import { Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { applyStandardTags, attachLambdaToResource } from "./stackUtils";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { SERVICE_NAME } from "./constants";

interface LambdaConfig {
  lambda?: IFunction;
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
      this.restApi = new apigateway.RestApi(this, `APIGatewayRestApi-${props.stage}`, {
        restApiName: `${SERVICE_NAME}-${props.stage}`,
        description: `API Gateway (v2) managed by CDK for stage: ${props.stage}`,
        deployOptions: {
          stageName: props.stage,
        },
        defaultCorsPreflightOptions: {
          allowOrigins: apigateway.Cors.ALL_ORIGINS,
          allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
          allowMethods: apigateway.Cors.ALL_METHODS,
        },
      });

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

      const userPool = cognito.UserPool.fromUserPoolArn(
        this,
        `ImportedUserPool-${props.stage}`,
        cognitoArn!,
      );

      const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
        this,
        `CognitoAuthorizer-${props.stage}`,
        {
          cognitoUserPools: [userPool],
        },
      );

      attachLambdaToResource(this, this.restApi.root, expressLambda);

      const rootProxyResource = this.restApi.root.addResource("{proxy+}");
      attachLambdaToResource(this, rootProxyResource, expressLambda, authorizer);

      const healthResource = this.restApi.root.addResource("health");
      const proxyHealthResource = healthResource.addResource("{proxy+}");
      attachLambdaToResource(this, proxyHealthResource, expressLambda);
      attachLambdaToResource(this, healthResource, expressLambda);

      const api = this.restApi.root.addResource("api");
      attachLambdaToResource(this, api, expressLambda);

      for (const resource of ["external", "guest", "mgmt", "self-reg"]) {
        const subResource = api.addResource(resource);
        attachLambdaToResource(this, subResource, expressLambda);
        // only add {proxy+} for external, guest, and mgmt
        if (["external", "guest", "mgmt"].includes(resource)) {
          const proxyResource = subResource.addResource("{proxy+}");
          attachLambdaToResource(this, proxyResource, expressLambda);
        }
      }

      const usersResource = api.addResource("users");
      attachLambdaToResource(this, usersResource, expressLambda);

      const emailResource = usersResource.addResource("emailCheck");
      attachLambdaToResource(this, emailResource, expressLambda);
      if (githubLambda) {
        const cmsResource = api.addResource("cms");
        attachLambdaToResource(this, cmsResource, githubLambda);
      }

      new CfnOutput(this, "ApiGatewayId", {
        value: this.restApi.restApiId,
        exportName: `${SERVICE_NAME}-${props.stage}-ApiGatewayId`,
      });
    }
  }
}
