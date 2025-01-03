# Assuming a prod user in dev

1. If you haven't configured the AWS CLI to authenticate via the Access Portal, do so via [the docs](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html#cli-configure-sso-configure), or follow along here:

   - Run `aws configure sso` and follow the prompt with the following values:

     - `SSO session name (Recommended)`: Set this to `njoit` or something similarly recognizable. Using a session name lets you explicitly map roles to specific SSO sessions in the follow steps.
     - `SSO start URL`: https://njoitaws.awsapps.com/start
     - `SSO start region`: `us-east-1`
     - `SSO registration scopes [sso:account:access]`: Press enter for the default value and your browser will prompt you for authorizing the CLI to access your AWS account.

2. Since we're both querying data from prod and updating data in dev, we'll need to set up profiles for both environments. This is where the session name from the previous step comes in handy:

   ```shell
   aws configure --profile navigator-prod
   # SSO session name (Recommended):
   ```

   This time, when prompted with `SSO session name`, input the session name you just used. The CLI should autocomplete it, as well as display that it already has as configuration for that name. For example, if you used `njoit` as the session name, the CLI should display:

   ```shell
   Configuration for SSO session: njoit
   {
     "sso_start_url": "https://njoitaws.awsapps.com/start",
     "sso_region": "us-east-1",
     "sso_registration_scopes": "sso:account:access"
    }
   ```

   Selecting this, the CLI should then say "There are 3 AWS accounts available to you." Choose prod and fill out the rest of the prompts accordingly.

3. Repeat step 2, but this time for the dev environment and a profile name like `navigator-dev`.

4. Now that we have profiles for both environments with their profile names stored, we are ready to run the script:

   ```shell
   ./api/scripts/full-script.sh --prod-uuid <PROD-ACCOUNT-UUID> --dev-uuid <DEV-ACCOUNT-UUID>
   ```

5. The script should run and output the results to the console. If it exits early, you should be able to tell by how far the output goes.

6. Once you're done assuming the prod user, don't forget to reset the dev user's data:

   ```shell
   .api/scripts/revert-dev-user.sh --dev-uuid <DEV-ACCOUNT-UUID>
   ```

---

## Open questions

- Do we need to update the user email, too? Or can that stay the same from an authentication perspective?
