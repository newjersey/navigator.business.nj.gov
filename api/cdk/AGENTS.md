# api/cdk/

AWS CDK infrastructure for the backend. This workspace defines application-level
AWS resources, including Lambda, API Gateway, DynamoDB wiring, IAM, storage, and
monitoring stacks.

## Commands

```bash
yarn build
yarn test
yarn lint
yarn cdk synth
yarn cdk diff
```

From the repo root, use the workspace name:

```bash
yarn workspace @businessnjgovnavigator/api-cdk cdk synth
yarn workspace @businessnjgovnavigator/api-cdk cdk diff
```

## Boundaries

- CDK lives in `api/cdk`; backend Lambda implementation lives in `api/src`.
- Some foundational infrastructure remains in Terraform. Do not move existing
  production DynamoDB tables, shared CloudWatch resources, DNS, Cognito,
  Amplify, KMS, or selected SSM ownership into CDK without an explicit
  migration plan.
- CDK imports existing remote DynamoDB tables in cloud environments and creates
  local DynamoDB tables for local development.

## Stack Layout

- `bin/app.ts` wires stacks in dependency order.
- `lib/dataStack.ts` creates local DynamoDB tables or imports remote ones.
- `lib/iamStack.ts` defines IAM roles and permissions.
- `lib/lambdaStack.ts` defines and builds Lambda functions.
- `lib/apiStack.ts` configures API Gateway and Cognito authorization.
- `lib/constants.ts` and `lib/stackUtils.ts` hold shared infrastructure naming
  and helper logic.

## Practices

- Keep stack responsibilities separate. Do not add application business logic to
  CDK files.
- Prefer existing helpers in `lib/stackUtils.ts` before adding new construct
  wiring.
- Treat IAM changes as high-risk. Use the narrowest action/resource scope that
  supports the Lambda or service behavior.
- Run `cdk diff` for infrastructure behavior changes and include notable
  resource replacements or permission expansions in the PR description.
