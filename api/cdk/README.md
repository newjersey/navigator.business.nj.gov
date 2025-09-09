## CDK Infrastructure Overview

The CDK project for the backend lives in `api/cdk`. It defines application-level AWS infrastructure including:

- Lambda functions
- API Gateway
- Data storage (DynamoDB tables)
- IAM roles & Lambda execution permissions

### DynamoDB & Terraform

The existing remote DynamoDB tables for users and businesses are provisioned by Terraform and are
imported by CDK in non-local stages (dev/test/prod).

CDK creates local DynamoDB tables for development.

New DynamoDB tables going forward (beyond the existing users and businesses tables)
will be created and managed via CDK, unless otherwise noted.

### Terraform note

Some foundational infrastructure (including production DynamoDB tables) is provisioned via Terraform.
CDK currently:

- Creates local DynamoDB tables for development
- Imports existing DynamoDB tables in remote stages (dev/test/prod)
- Manages new infra moving forward

Over time, newer backend infrastructure may migrate fully to CDK.

### Entrypoint

The CDK entry file is `bin/app.ts`, which initializes the stacks in dependency order:

- `DataStack` — creates local DynamoDB tables or imports remote ones
- `IamStack` — defines IAM roles and permissions
- `LambdaStack` — defines and builds Lambda functions
- `ApiStack` — configures API Gateway & Cognito authorization

### Stack Responsibilities

| Stack | Purpose |
|-------|--------|
| **DataStack** | Creates DynamoDB tables for local environment; imports existing remote tables |
| **IamStack** | Creates IAM roles & permissions for Lambda |
| **LambdaStack** | Builds and configures Lambda functions (Express, GitHub OAuth, migrations, etc.) |
| **ApiStack** | Creates API Gateway resources & routes and attaches Lambdas |
| **stackUtils.ts** | Utility helpers used across stacks |
| **constants.ts** | Shared stack constants and resource names |

### CDK Commands
- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template
