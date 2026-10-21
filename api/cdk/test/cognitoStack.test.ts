import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { CognitoStack } from "../lib/cognitoStack";

const TEST_ENVIRONMENT = { account: "123456789012", region: "us-east-1" };
const PROFILE_NJ_CONFIG = {
  client_id: "profile-nj-client-id",
  client_secret: "profile-nj-client-secret",
  issuer: "https://login-sandbox.profile.nj.gov",
};

interface CreateCognitoTemplateProps {
  readonly stage: string;
}

const createCognitoTemplate = (props: CreateCognitoTemplateProps): Template => {
  const app = new App();
  const stack = new CognitoStack(app, `CognitoStack-${props.stage}`, {
    stage: props.stage,
    env: TEST_ENVIRONMENT,
    authRoleArn: "arn:aws:iam::123456789012:role/auth",
    unAuthRoleArn: "arn:aws:iam::123456789012:role/unauth",
  });
  return Template.fromStack(stack);
};

const writeProfileNJConfigFile = (): string => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "profilenj-config-"));
  const filePath = path.join(directory, "profilenj-oidc.json");
  fs.writeFileSync(filePath, JSON.stringify(PROFILE_NJ_CONFIG));
  return filePath;
};

const webClientProviders = (template: Template): unknown => {
  const clients = template.findResources("AWS::Cognito::UserPoolClient", {
    Properties: { ClientName: Match.stringLikeRegexp("clientWeb") },
  });
  const [webClient] = Object.values(clients) as {
    Properties: { SupportedIdentityProviders: unknown };
  }[];
  return webClient.Properties.SupportedIdentityProviders;
};

const RESIDENT_ID_SCHEMA_ATTRIBUTE = Match.objectLike({ Name: "profileNJResidentId" });

describe("CognitoStack", () => {
  const originalEnvironment = { ...process.env };

  beforeEach(() => {
    delete process.env.COGNITO_METADATA_FILE;
    delete process.env.PROFILE_NJ_OIDC_CONFIG_FILE;
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...originalEnvironment };
    jest.restoreAllMocks();
  });

  describe("in a ProfileNJ environment (dev)", () => {
    it("adds the ProfileNJ OIDC provider from the config file", () => {
      process.env.PROFILE_NJ_OIDC_CONFIG_FILE = writeProfileNJConfigFile();
      const template = createCognitoTemplate({ stage: "dev" });

      expect(() => {
        template.hasResourceProperties("AWS::Cognito::UserPoolIdentityProvider", {
          ProviderName: "ProfileNJ",
          ProviderType: "OIDC",
          ProviderDetails: {
            client_id: PROFILE_NJ_CONFIG.client_id,
            client_secret: PROFILE_NJ_CONFIG.client_secret,
            oidc_issuer: PROFILE_NJ_CONFIG.issuer,
            authorize_scopes: "openid email profile",
            attributes_request_method: "GET",
          },
          AttributeMapping: {
            email: "email",
            email_verified: "email_verified",
            "custom:profileNJResidentId": "https://login.nj.gov/claims/resident_id",
          },
        });
      }).not.toThrow();
    });

    it("adds the resident ID custom attribute and attaches ProfileNJ to the web client", () => {
      process.env.PROFILE_NJ_OIDC_CONFIG_FILE = writeProfileNJConfigFile();
      const template = createCognitoTemplate({ stage: "dev" });

      template.hasResourceProperties("AWS::Cognito::UserPool", {
        Schema: Match.arrayWith([
          Match.objectLike({
            Name: "profileNJResidentId",
            AttributeDataType: "String",
            Mutable: true,
          }),
        ]),
      });
      expect(webClientProviders(template)).toEqual(["myNJ", "ProfileNJ"]);
    });

    it("fails instead of dropping ProfileNJ when the config file is missing", () => {
      expect(() => createCognitoTemplate({ stage: "dev" })).toThrow(/PROFILE_NJ_OIDC_CONFIG_FILE/);
    });
  });

  describe.each(["prod", "staging"])("in a non-ProfileNJ environment (%s)", (stage) => {
    it("has no ProfileNJ provider, attribute, or client entry even when a config file is set", () => {
      process.env.PROFILE_NJ_OIDC_CONFIG_FILE = writeProfileNJConfigFile();
      const template = createCognitoTemplate({ stage });

      template.resourcePropertiesCountIs(
        "AWS::Cognito::UserPoolIdentityProvider",
        { ProviderName: "ProfileNJ" },
        0,
      );
      template.hasResourceProperties("AWS::Cognito::UserPool", {
        Schema: Match.not(Match.arrayWith([RESIDENT_ID_SCHEMA_ATTRIBUTE])),
      });
      expect(webClientProviders(template)).toEqual(["myNJ"]);
    });
  });
});
