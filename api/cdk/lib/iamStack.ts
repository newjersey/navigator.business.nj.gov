import { Stack, StackProps } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { applyStandardTags } from "./stackUtils";

export interface IamStackProps extends StackProps {
  stage: string;
}

export class IamStack extends Stack {
  public readonly authRole?: iam.Role;
  public readonly unauthRole?: iam.Role;

  constructor(scope: Construct, id: string, props: IamStackProps) {
    super(scope, id, props);

    // Create Cognito Identity Pool roles if identity pool IDs are provided
    const sharedIdentityPoolIds = process.env.SHARED_IDENTITY_POOL_IDS;
    if (sharedIdentityPoolIds) {
      // Authenticated role for Cognito Identity Pool
      const identityPoolIds =
        process.env.SHARED_IDENTITY_POOL_IDS?.split(",") ?? [];

      if (identityPoolIds.length === 0) {
        throw new Error("SHARED_IDENTITY_POOL_IDS must be set");
      }

      const authRole = new iam.Role(this, "navigatorAuthRole", {
        roleName: "navigator_authRole",
        description: "Role for authenticated users via Cognito Identity Pool",
        assumedBy: new iam.FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
              "cognito-identity.amazonaws.com:aud": identityPoolIds,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "authenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity",
        ),
      });

      applyStandardTags(authRole, props.stage);
      this.authRole = authRole;

      // Unauthenticated role for Cognito Identity Pool
      const unauthRole = new iam.Role(this, "navigatorUnauthRole", {
        assumedBy: new iam.FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
              "cognito-identity.amazonaws.com:aud": identityPoolIds,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "unauthenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity",
        ),
        roleName: "navigator_unauthRole",
        description: "Role for unauthenticated users via Cognito Identity Pool",
      });

      applyStandardTags(unauthRole, props.stage);
      this.unauthRole = unauthRole;
    }
  }
}
