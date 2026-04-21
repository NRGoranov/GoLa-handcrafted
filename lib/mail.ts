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

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export async function sendInquiryMail(data: InquiryPayload): Promise<void> {
  const host = requiredEnv("SMTP_HOST");
  const port = Number(requiredEnv("SMTP_PORT"));
  const user = requiredEnv("SMTP_USER");
  const pass = requiredEnv("SMTP_PASS");
  const toEmail = requiredEnv("TO_EMAIL");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

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
    from: `"GoLa Handcrafted Inquiry" <${user}>`,
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
