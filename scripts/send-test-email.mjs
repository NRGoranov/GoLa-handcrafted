import nodemailer from "nodemailer";

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;
const to = process.env.TO_EMAIL || user;

if (!user || !pass) {
  console.error("EMAIL_USER and EMAIL_PASSWORD required");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: { user, pass }
});

const info = await transporter.sendMail({
  from: `"GoLa Handcrafted" <${user}>`,
  to,
  subject: "GoLa inquiry email test",
  text: "If you received this, inquiry notifications are working."
});

console.log("Sent:", info.messageId, "to", to);
