import { Resend } from "resend";
import type { EmailClient, SendResultEmailInput } from "./types";

export function createResendEmailClient(config: {
  apiKey: string;
  from: string;
}): EmailClient {
  const resend = new Resend(config.apiKey);
  return {
    async sendResultEmail(input: SendResultEmailInput) {
      const lines = [
        "Your CallMeMing Chinese names are ready.",
        "",
        `Open your secure link: ${input.resultUrl}`,
        "",
        "Plain-text backup:",
        ...input.cards.flatMap((c, i) => [
          `${i + 1}. ${c.hanzi} (${c.pinyin})`,
          `   Approx.: ${c.phoneticHint}`,
          `   Intro: ${c.selfIntroduction}`,
          "",
        ]),
        "CallMeMing does not sell destiny readings.",
      ];
      const { error } = await resend.emails.send({
        from: config.from,
        to: input.to,
        subject: "Your CallMeMing Chinese names",
        text: lines.join("\n"),
      });
      if (error) throw new Error(error.message);
    },
  };
}
