import { PublishCommand, PublishCommandOutput, SNSClient } from "@aws-sdk/client-sns";

export const snsClient = new SNSClient({});

export const publishSnsMessage = async (
  message: string,
  topicArn: string,
): Promise<PublishCommandOutput | void> => {
  const formattedMessage = {
    version: "1.0",
    source: "custom",
    content: {
      textType: "client-markdown",
      title: `:warning: CMS Integrity Test Failure`,
      description: `${message}`,
    },
    metadata: {
      enableCustomActions: true,
    },
  };

  try {
    const response = await snsClient.send(
      new PublishCommand({
        Message: JSON.stringify(formattedMessage),
        TopicArn: topicArn,
      }),
    );
    return response;
  } catch (error) {
    console.error(`Error when trying to send AWS SNS message: ${error}`);
  }
};
