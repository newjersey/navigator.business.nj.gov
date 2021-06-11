#!/usr/bin/env bash

set -e

if [ -z "$AWS_ACCESS_KEY_ID" ] && [ -z "$AWS_SECRET_ACCESS_KEY" ] ; then
  echo "You must provide the action with both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables in order to deploy"
  exit 1
fi

if [ -z "$AWS_REGION" ] ; then
  echo "You must provide AWS_REGION environment variable in order to deploy"
  exit 1
fi

if [ -z "$AMPLIFY_ENV" ] ; then
  echo "You must provide AMPLIFY_ENV environment variable in order to deploy"
  exit 1
fi

aws_config_file_path="$(pwd)/aws_config_file_path.json"
echo '{"accessKeyId":"'$AWS_ACCESS_KEY_ID'","secretAccessKey":"'$AWS_SECRET_ACCESS_KEY'","region":"'$AWS_REGION'"}' > $aws_config_file_path
echo '{"projectPath": "'"$(pwd)"'","defaultEditor":"code","envName":"'$AMPLIFY_ENV'"}' > ./amplify/.config/local-env-info.json
echo '{"'$AMPLIFY_ENV'":{"configLevel":"project","useProfile":false,"awsConfigFilePath":"'$aws_config_file_path'"}}' > ./amplify/.config/local-aws-info.json

amplify env pull --yes