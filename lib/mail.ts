import nodemailer from "nodemailer";

export type InquiryPayload = {
  name: string;
  email: string;
  contactMethod: string;
  inquiryType: string;
  message: string;
  location?: string;
  preferredSize?: string;
  locale?: "en" | "bg";
};

const SMTP_VARS = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "TO_EMAIL"] as const;

function usesLegacyGmailEnv(): boolean {
  return Boolean(process.env.EMAIL_USER?.trim() && process.env.EMAIL_PASSWORD?.trim());
}

export function isSmtpConfigured(): boolean {
  if (usesLegacyGmailEnv()) return true;
  return SMTP_VARS.every((name) => Boolean(process.env[name]?.trim()));
}

/** Comma-separated list in TO_EMAIL, e.g. a@x.com,b@y.com */
export function getRecipientEmails(senderEmail: string): string[] {
  const raw = process.env.TO_EMAIL?.trim();
  if (!raw) return [senderEmail];

  const emails = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return emails.length > 0 ? emails : [senderEmail];
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
  const toEmails = getRecipientEmails(senderEmail);
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
    to: toEmails,
    subject: `New ${data.inquiryType} inquiry from ${data.name}`,
    text,
    html,
    replyTo: data.email
  });

  await sendInquiryCopyToSender(transporter, senderEmail, data);
}

async function sendInquiryCopyToSender(
  transporter: nodemailer.Transporter,
  senderEmail: string,
  data: InquiryPayload
): Promise<void> {
  const locale = data.locale === "bg" ? "bg" : "en";
  const labels =
    locale === "bg"
      ? {
          subject: "Копие на запитването ти — GoLa Handcrafted",
          heading: "Копие на запитването ти",
          intro: "Благодарим, че се свърза с GoLa Handcrafted. Ето копие на изпратеното от теб запитване:",
          name: "Име",
          email: "Имейл",
          contactMethod: "Начин за контакт",
          inquiryType: "Тип запитване",
          location: "Локация",
          preferredSize: "Предпочитан размер",
          message: "Съобщение",
          notProvided: "Не е посочено",
          footer: "Ще се свържем с теб възможно най-скоро."
        }
      : {
          subject: "Copy of your inquiry — GoLa Handcrafted",
          heading: "Copy of your inquiry",
          intro: "Thank you for reaching out to GoLa Handcrafted. Here is a copy of the inquiry you submitted:",
          name: "Name",
          email: "Email",
          contactMethod: "Contact method",
          inquiryType: "Inquiry type",
          location: "Location",
          preferredSize: "Preferred size",
          message: "Message",
          notProvided: "Not provided",
          footer: "We will get back to you as soon as possible."
        };

  const text = [
    labels.heading,
    "",
    labels.intro,
    "",
    `${labels.name}: ${data.name}`,
    `${labels.email}: ${data.email}`,
    `${labels.contactMethod}: ${data.contactMethod}`,
    `${labels.inquiryType}: ${data.inquiryType}`,
    `${labels.location}: ${data.location || labels.notProvided}`,
    `${labels.preferredSize}: ${data.preferredSize || labels.notProvided}`,
    "",
    `${labels.message}:`,
    data.message,
    "",
    labels.footer
  ].join("\n");

  const html = `
    <h2>${escapeHtml(labels.heading)}</h2>
    <p>${escapeHtml(labels.intro)}</p>
    <p><strong>${escapeHtml(labels.name)}:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>${escapeHtml(labels.email)}:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>${escapeHtml(labels.contactMethod)}:</strong> ${escapeHtml(data.contactMethod)}</p>
    <p><strong>${escapeHtml(labels.inquiryType)}:</strong> ${escapeHtml(data.inquiryType)}</p>
    <p><strong>${escapeHtml(labels.location)}:</strong> ${escapeHtml(data.location || labels.notProvided)}</p>
    <p><strong>${escapeHtml(labels.preferredSize)}:</strong> ${escapeHtml(data.preferredSize || labels.notProvided)}</p>
    <p><strong>${escapeHtml(labels.message)}:</strong></p>
    <p>${escapeHtml(data.message).replace(/\n/g, "<br/>")}</p>
    <p>${escapeHtml(labels.footer)}</p>
  `;

  await transporter.sendMail({
    from: `"GoLa Handcrafted" <${senderEmail}>`,
    to: data.email,
    subject: labels.subject,
    text,
    html
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
