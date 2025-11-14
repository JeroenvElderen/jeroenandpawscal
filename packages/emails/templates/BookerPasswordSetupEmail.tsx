import type { TFunction } from "i18next";

import { APP_NAME, EMAIL_FROM_NAME } from "@calcom/lib/constants";

import renderEmail from "../src/renderEmail";
import BaseEmail from "./_base-email";

export type BookerPasswordSetup = {
  language: TFunction;
  user: {
    name?: string | null;
    email: string;
  };
  resetLink: string;
  brandName?: string;
};

export default class BookerPasswordSetupEmail extends BaseEmail {
  private readonly passwordSetupEvent: BookerPasswordSetup;

  constructor(passwordSetupEvent: BookerPasswordSetup) {
    super();
    this.name = "SEND_BOOKER_PASSWORD_SETUP_EMAIL";
    this.passwordSetupEvent = passwordSetupEvent;
  }

  protected async getNodeMailerPayload(): Promise<Record<string, unknown>> {
    const { language, user, resetLink, brandName } = this.passwordSetupEvent;

    return {
      to: `${user.name ?? user.email} <${user.email}>`,
      from: `${EMAIL_FROM_NAME} <${this.getMailerOptions().from}>`,
      subject: language("booker_password_setup_subject", { brandName: brandName ?? APP_NAME }),
      html: await renderEmail("BookerPasswordSetupEmail", {
        ...this.passwordSetupEvent,
        brandName: brandName ?? APP_NAME,
      }),
      text: this.getTextBody(),
    };
  }

  protected getTextBody(): string {
    const { language, user, resetLink, brandName } = this.passwordSetupEvent;
    return `
${language("booker_password_setup_subject", { brandName: brandName ?? APP_NAME })}
${language("booker_password_setup_greeting", { name: user.name ?? user.email })}
${language("booker_password_setup_intro", { brandName: brandName ?? APP_NAME })}
${language("booker_password_setup_cta")}: ${resetLink}
${language("booker_password_setup_instructions")}
${language("have_any_questions")} ${language("contact_our_support_team")}
`.replace(/(<([^>]+)>)/gi, "");
  }
}