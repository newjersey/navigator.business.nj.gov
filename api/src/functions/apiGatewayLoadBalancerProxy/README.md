# API Gateway Load Balancer Proxy

## Why This Lambda Exists

This Lambda is an interim target for the internal Application Load Balancers created by `ApiStack`.
It lets us put a load-balancer boundary in front of the existing API Gateway REST APIs without also
changing the API Gateway endpoint type in the same PR.

The long-term goal is to move the API Gateways behind private REST API endpoints. That path requires
REST APIs; HTTP APIs do not support private API Gateway endpoints in the same way. The current API
stack already uses `aws-cdk-lib/aws-apigateway.RestApi`, so this work focuses on adding the
load-balancer layer first while leaving the existing public API Gateway endpoint behavior unchanged.

The proxy is needed because an Application Load Balancer routes to registered targets. The public
`execute-api` hostname is service-managed by AWS and is not a stable target group member. Registering
resolved public API Gateway IP addresses would be brittle because AWS can change those addresses.
Instead, the ALB invokes this narrow Lambda target, and the Lambda forwards the request to the
deployed REST API stage URL from CDK.

This keeps the interim architecture explicit:

1. Client or upstream origin reaches the internal API ALB.
2. ALB invokes `apiGatewayLoadBalancerProxy`.
3. The proxy rebuilds the HTTP request and sends it to the existing deployed REST API stage URL.
4. API Gateway continues routing to the existing API Lambda integrations.

The proxy strips hop-by-hop headers such as `host`, `connection`, and `content-length` before
forwarding. Those headers describe the ALB-to-Lambda request, not the rebuilt upstream request to API
Gateway, and preserving them can cause incorrect routing or body framing.

## How To Deploy

This Lambda is not deployed independently from this folder. CDK creates and bundles it as part of
`ApiStack`.

The standard deployment path is the existing CDK deployment workflow:

1. Ensure the target environment has the existing API/CDK environment variables configured,
   including `STAGE`, `AWS_ACCOUNT_ID`, `API_GATEWAY_CERT_ARN`, `VPC_ID`, `SUBNET_ID_01`,
   `SUBNET_ID_02`, `SG_ID`, and `COGNITO_USER_POOL_ID`.
2. Run the normal environment deployment workflow, which uses `.github/actions/deploy-cdk/action.yml`.
   That action clears CDK context, bootstraps, imports prerequisite stacks, and runs:

   ```shell
   yarn workspace @businessnjgovnavigator/api-cdk cdk deploy --all --qualifier biz-nj --verbose --region us-east-1
   ```

3. CDK deploys `ApiStack-${STAGE}`, which creates:
   - the internal API Application Load Balancer,
   - the HTTPS listener,
   - the Lambda target group,
   - this proxy Lambda,
   - Lambda invoke permission for Elastic Load Balancing, and
   - stack outputs for the ALB DNS name, target group ARN, and listener ARN.

For local verification before deploy, run:

```shell
yarn workspace @businessnjgovnavigator/api-cdk test apiStack.test.ts --runInBand
yarn test api/src/functions/apiGatewayLoadBalancerProxy/app.test.ts --selectProjects api --runInBand
yarn workspace @businessnjgovnavigator/api-cdk build
yarn workspace @businessnjgovnavigator/api typecheck
```

After deployment, verify the CloudFormation outputs from `ApiStack-${STAGE}`:

- `ApiLoadBalancerDnsName`
- `ApiLoadBalancerTargetGroupArn`
- `ApiLoadBalancerListenerArn`

Those outputs are the handoff points for later DNS, WAF, or upstream origin wiring.

## What Comes Next

The next infrastructure step is to decide how traffic should reach the new internal API ALBs in each
environment. That likely means wiring the exported ALB DNS names into the external routing layer that
will own the public hostname or upstream origin behavior.

The private API Gateway migration is separate and should be handled deliberately. At that point:

1. Create or import the API Gateway interface VPC endpoint for each relevant VPC.
2. Convert the REST API endpoint configuration to the private API pattern.
3. Add the API Gateway resource policy that allows only the intended VPC endpoint or VPC source.
4. Replace the Lambda proxy target path with the private REST API/VPC endpoint target pattern.
5. Update CDK tests to assert the private endpoint resources and remove the Lambda proxy assertions.
6. Validate that existing clients use the load-balanced path before disabling any older public path.

The CDK shape should change in `ApiStack` when that migration happens:

1. Import or create the execute-api interface endpoint in the same VPC used by the internal API ALB.
   If the endpoint already exists, import it by ID and private IP addresses rather than creating a
   second endpoint per API.
2. Update the `RestApi` construct to use an explicit private endpoint configuration:

   ```ts
   endpointConfiguration: {
     types: [apigateway.EndpointType.PRIVATE],
     vpcEndpoints: [executeApiEndpoint],
   },
   ```

3. Add a resource policy to the REST API that denies invoke requests unless they come from the
   approved VPC endpoint, usually by checking `aws:SourceVpce`. This should live next to the REST API
   construction so private access and the API resource policy are reviewed together.
4. Replace `createLoadBalancerProxyLambda` and the Lambda target group with a target group that
   reaches API Gateway through the private endpoint path. The likely shape is:
   - keep the internal ALB and HTTPS listener,
   - create an API Gateway target group backed by the interface endpoint private IPs,
   - use HTTPS health checks against a route that does not require Cognito, such as `/health`, and
   - preserve or explicitly set the `Host` behavior required by the private API/custom domain path.
5. Revisit `configureCustomDomain`. Public custom domains cannot simply be converted into private
   custom domains, so the private API path may need a separate private custom domain, endpoint
   association, or host-header based routing rule depending on the final DNS design.
6. Remove `API_GATEWAY_PROXY_BASE_URL` from the stack because the ALB should no longer invoke this
   Lambda or call the public REST API stage URL.

The private cutover should also add CDK assertions that prove the API is private and reachable only
through the intended path:

- `AWS::ApiGateway::RestApi` has `EndpointConfiguration.Types: ["PRIVATE"]`.
- The REST API resource policy includes the expected `aws:SourceVpce` condition.
- The ALB target group no longer has `TargetType: "lambda"`.
- The proxy Lambda and `AWS::Lambda::Permission` for `elasticloadbalancing.amazonaws.com` no longer
  exist.
- The replacement target group points at the private endpoint or private custom domain routing
  resources expected by the final architecture.

## When This Lambda Can Be Removed

Remove this Lambda only after all of the following are true:

- The API Gateway REST APIs that need this path have moved to the private endpoint architecture.
- The internal API ALB listener no longer forwards to a Lambda target group.
- The replacement ALB target path reaches the private REST API through the approved VPC endpoint
  pattern.
- DNS, WAF, and upstream origins no longer depend on the Lambda proxy behavior.
- CloudWatch metrics or logs confirm there is no expected production traffic invoking this proxy.
- The CDK tests have been updated to assert the replacement private routing model.

When those conditions are met, delete this folder, remove `createLoadBalancerProxyLambda` and the
Lambda target group wiring from `ApiStack`, and replace the proxy unit tests with coverage for the
new private routing resources.
