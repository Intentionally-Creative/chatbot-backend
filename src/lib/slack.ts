import { IncomingWebhook } from "@slack/webhook";
import { envVariables } from "../env-config.js";

const webhook = new IncomingWebhook(envVariables.SLACK_WEBHOOK_URL);

export async function sendSlackMessage(message: string) {
  const environment = envVariables.NODE_ENV || "development";

  // Only send messages if not in development environment
  // if (environment === "development") {
  //   console.log("Slack message not sent: running in development environment");
  //   return;
  // }

  const formattedMessage = `(${environment.toUpperCase()}) ${message}`;

  try {
    await webhook.send({
      text: formattedMessage,
    });
    console.log("Slack message delivered: ", formattedMessage);
  } catch (error) {
    console.error("Failed to send Slack message: ", error);
  }
}
