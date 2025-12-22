import {
  API_SERVICE_NAME,
  REMINDER_EMAIL_CONFIG_SET_NAME,
  WELCOME_EMAIL_A_CONFIG_SET_NAME,
  WELCOME_EMAIL_B_CONFIG_SET_NAME,
} from "@businessnjgovnavigator/api/src/libs/constants";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { applyStandardTags, attachLambdaToResource, createSesConfigSet } from "./stackUtils";

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
      return;
    }
    this.restApi = new apigateway.RestApi(this, `APIGatewayRestApi-${props.stage}`, {
      restApiName: `${API_SERVICE_NAME}-${props.stage}`,
      description: `API Gateway managed by CDK for stage: ${props.stage}`,
      deployOptions: {
        stageName: props.stage,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    this.addGatewayResponses();
    const expressLambda = props.lambdas.express?.lambda;
    const githubLambda = props.lambdas.githubOauth2?.lambda;

    const authorizer = this.createCognitoAuthorizer(props.stage);
    this.setupRootRoutes(expressLambda!, authorizer);
    this.setupApiRoutes(expressLambda!, githubLambda);

    new CfnOutput(this, "ApiGatewayId", {
      value: this.restApi.restApiId,
      exportName: `${API_SERVICE_NAME}-${props.stage}-ApiGatewayId`,
    });

    createSesConfigSet(this, WELCOME_EMAIL_A_CONFIG_SET_NAME);
    createSesConfigSet(this, WELCOME_EMAIL_B_CONFIG_SET_NAME);
    createSesConfigSet(this, REMINDER_EMAIL_CONFIG_SET_NAME);
  }

  private addGatewayResponses() {
    const responses = [
      { id: "Global4xxCorsResponse", type: "DEFAULT_4XX" },
      { id: "Global5xxCorsResponse", type: "DEFAULT_5XX" },
      { id: "UnauthorizedCorsResponse", type: "UNAUTHORIZED" },
    ];

    for (const { id, type } of responses) {
      new apigateway.CfnGatewayResponse(this, id, {
        restApiId: this.restApi.restApiId,
        responseType: type,
        responseParameters: {
          "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
          "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
          "gatewayresponse.header.Access-Control-Allow-Methods": "'*'",
        },
      });
    }
  }

  private createCognitoAuthorizer(stage: string) {
    const userPoolId = process.env.COGNITO_USER_POOL_ID!;
    const arn = `arn:aws:cognito-idp:${Stack.of(this).region}:${Stack.of(this).account}:userpool/${userPoolId}`;

    const userPool = cognito.UserPool.fromUserPoolArn(this, `UserPool-${stage}`, arn);

    return new apigateway.CognitoUserPoolsAuthorizer(this, `CognitoAuth-${stage}`, {
      cognitoUserPools: [userPool],
    });
  }

  private setupRootRoutes(lambda: IFunction, authorizer: apigateway.CognitoUserPoolsAuthorizer) {
    attachLambdaToResource(this, this.restApi.root, lambda);
    const proxy = this.restApi.root.addResource("{proxy+}");
    attachLambdaToResource(this, proxy, lambda, authorizer);

    this.setupHealthRoutes(lambda);
  }

  private setupHealthRoutes(lambda: IFunction) {
    const health = this.restApi.root.addResource("health");
    attachLambdaToResource(this, health, lambda);
    const proxy = health.addResource("{proxy+}");
    attachLambdaToResource(this, proxy, lambda);
  }

  private setupApiRoutes(expressLambda: IFunction, githubLambda?: IFunction) {
    const api = this.restApi.root.addResource("api");
    attachLambdaToResource(this, api, expressLambda);

    const subRoutes = [
      { name: "external", proxy: true },
      { name: "guest", proxy: true },
      { name: "mgmt", proxy: true },
      { name: "self-reg", proxy: false },
    ];

    for (const { name, proxy } of subRoutes) {
      const route = api.addResource(name);
      attachLambdaToResource(this, route, expressLambda);

      if (proxy) {
        const proxyRoute = route.addResource("{proxy+}");
        attachLambdaToResource(this, proxyRoute, expressLambda);
      }
    }

    const users = api.addResource("users");
    attachLambdaToResource(this, users, expressLambda);

    const email = users.addResource("emailCheck");
    attachLambdaToResource(this, email, expressLambda);

    if (githubLambda) {
      const cms = api.addResource("cms");
      attachLambdaToResource(this, cms, githubLambda);
    }
  }
}
