import nodemailer from "nodemailer";
import type { EmailSettings } from "@/lib/settings/email-settings";

export type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

export type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  attachments?: MailAttachment[];
};

export type SendMailResult =
  | { ok: true; messageId?: string }
  | { ok: false; error: string };

export async function sendMail(
  settings: EmailSettings,
  input: SendMailInput
): Promise<SendMailResult> {
  if (!settings.enabled) {
    return { ok: false, error: "Envoi email désactivé (configuration incomplète)" };
  }

  if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) {
    return { ok: false, error: "Configuration SMTP incomplète" };
  }

  try {
    const transport = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
    });

    const info = await transport.sendMail({
      from: `"${settings.fromName}" <${settings.fromAddress}>`,
      to: input.to,
      subject: input.subject,
      text: input.text,
      attachments: input.attachments?.map((file) => ({
        filename: file.filename,
        content: file.content,
        contentType: file.contentType ?? "application/pdf",
      })),
    });

    return { ok: true, messageId: info.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur SMTP inconnue";
    return { ok: false, error: message };
  }
}
