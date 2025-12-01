## CDK Infrastructure Overview

The CDK project for the backend lives in `api/cdk`. It defines application-level AWS infrastructure including:

- Lambda functions
- API Gateway
- Data storage (DynamoDB tables)
- IAM roles & Lambda execution permissions

### DynamoDB & Terraform

The existing remote DynamoDB tables for users and businesses are provisioned by Terraform and are
imported by CDK in all cloud environments.

CDK creates local DynamoDB tables for development.

New DynamoDB tables will be created and managed via CDK, unless otherwise noted.

### Terraform note

Some foundational infrastructure remains managed in **Terraform**.
This includes long-lived or shared resources such as:

- **Production DynamoDB tables**
- **CloudWatch** alarms and log groups
- **S3** buckets for assets and configuration
- **DNS** and domain mappings
- **SNS** topics and subscriptions
- **KMS** keys and selected **SSM** parameters
- **Cognito** user pools and **Amplify** configuration for authentication and hosting
- **AWS Backup** plans and vaults for DynamoDB tables

These resources are maintained outside CDK to preserve existing state and integrations.

### Entrypoint

The CDK entry file is `bin/app.ts`, which initializes the stacks in dependency order:

- `DataStack` — creates local DynamoDB tables or imports remote ones
- `IamStack` — defines IAM roles and permissions
- `LambdaStack` — defines and builds Lambda functions
- `ApiStack` — configures API Gateway & Cognito authorization

### Stack Responsibilities

| Stack           | Purpose                                                                          |
| --------------- | -------------------------------------------------------------------------------- |
| **DataStack**   | Creates DynamoDB tables for local environment; imports existing remote tables    |
| **IamStack**    | Creates IAM roles & permissions for Lambda                                       |
| **LambdaStack** | Builds and configures Lambda functions (Express, GitHub OAuth, migrations, etc.) |
| **ApiStack**    | Creates API Gateway resources & routes and attaches Lambdas                      |

### Supporting Files

- `constants.ts`- shared naming and constants across stacks. (e.g. DynamoDB table names).
- `stackUtils.ts` - helper functions for stack definitions (e.g. createLambdaFunction)

### CDK Commands

- `yarn run test` perform the jest unit tests
- `yarn cdk diff` compare deployed stack with current state
- `yarn cdk synth` emits the synthesized CloudFormation template
