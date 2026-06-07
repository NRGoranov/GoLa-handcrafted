import nodemailer from "nodemailer";

export type InquiryPayload = {
  name: string;
  email: string;
  contactMethod: string;
  inquiryType: string;
  message: string;
  location?: string;
  preferredSize?: string;
};

const SMTP_VARS = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "TO_EMAIL"] as const;

function usesLegacyGmailEnv(): boolean {
  return Boolean(process.env.EMAIL_USER?.trim() && process.env.EMAIL_PASSWORD?.trim());
}

export function isSmtpConfigured(): boolean {
  if (usesLegacyGmailEnv()) return true;
  return SMTP_VARS.every((name) => Boolean(process.env[name]?.trim()));
}

function getRecipientEmail(senderEmail: string): string {
  return process.env.TO_EMAIL?.trim() || senderEmail;
}

function createTransporter() {
  if (usesLegacyGmailEnv()) {
    return nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER!.trim(),
        pass: process.env.EMAIL_PASSWORD!.trim()
      }
    });
  }

  const port = Number(process.env.SMTP_PORT);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST!.trim(),
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER!.trim(),
      pass: process.env.SMTP_PASS!.trim()
    }
  });
}

function getSenderEmail(): string {
  if (usesLegacyGmailEnv()) {
    return process.env.EMAIL_USER!.trim();
  }
  return process.env.SMTP_USER!.trim();
}

export async function sendInquiryMail(data: InquiryPayload): Promise<void> {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP is not configured.");
  }

  const senderEmail = getSenderEmail();
  const toEmail = getRecipientEmail(senderEmail);
  const transporter = createTransporter();

  const text = [
    "New inquiry from GoLa Handcrafted website",
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Contact Method: ${data.contactMethod}`,
    `Inquiry Type: ${data.inquiryType}`,
    `Location: ${data.location || "Not provided"}`,
    `Preferred Size: ${data.preferredSize || "Not provided"}`,
    "",
    "Message:",
    data.message
  ].join("\n");

  const html = `
    <h2>New Inquiry - GoLa Handcrafted</h2>
    <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Contact Method:</strong> ${escapeHtml(data.contactMethod)}</p>
    <p><strong>Inquiry Type:</strong> ${escapeHtml(data.inquiryType)}</p>
    <p><strong>Location:</strong> ${escapeHtml(data.location || "Not provided")}</p>
    <p><strong>Preferred Size:</strong> ${escapeHtml(data.preferredSize || "Not provided")}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(data.message).replace(/\n/g, "<br/>")}</p>
  `;

  await transporter.sendMail({
    from: `"GoLa Handcrafted Inquiry" <${senderEmail}>`,
    to: toEmail,
    subject: `New ${data.inquiryType} inquiry from ${data.name}`,
    text,
    html,
    replyTo: data.email
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
