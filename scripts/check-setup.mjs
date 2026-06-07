#!/usr/bin/env node

const requiredAdmin = ["ADMIN_PASSWORD", "ADMIN_SESSION_SECRET"];
const smtpVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "TO_EMAIL"];
const legacyGmailVars = ["EMAIL_USER", "EMAIL_PASSWORD"];
const supabaseVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];

function isSmtpConfigured() {
  if (legacyGmailVars.every(has)) return true;
  return smtpVars.every((name) => has(name));
}

function has(name) {
  return Boolean(process.env[name]?.trim());
}

function section(title) {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
}

console.log("GoLa setup check");
console.log("================");

section("Admin panel");
for (const name of requiredAdmin) {
  console.log(`${has(name) ? "OK" : "MISSING"}  ${name}`);
}
console.log(has("ADMIN_PASSWORD") && has("ADMIN_SESSION_SECRET")
  ? "You can sign in at /admin/login"
  : "Add ADMIN_PASSWORD and ADMIN_SESSION_SECRET to .env.local");

section("Inquiry email (SMTP)");
const smtpReady = isSmtpConfigured();
if (legacyGmailVars.every(has)) {
  console.log("OK   EMAIL_USER + EMAIL_PASSWORD (DiplomnaWork-style Gmail)");
  console.log(`${has("TO_EMAIL") ? "OK" : "INFO"}  TO_EMAIL (defaults to sender if missing)`);
} else {
  for (const name of smtpVars) {
    console.log(`${has(name) ? "OK" : "MISSING"}  ${name}`);
  }
}
console.log(smtpReady
  ? "Inquiry form sends email notifications."
  : "Email missing — form still saves locally in dev.");

section("Supabase (production persistence)");
const supabaseReady = supabaseVars.every(has);
for (const name of supabaseVars) {
  console.log(`${has(name) ? "OK" : "MISSING"}  ${name}`);
}
console.log(supabaseReady
  ? "Sections and inquiries persist on Vercel."
  : "Local dev uses data/content-sections.json until Supabase is added.");

section("Summary");
if (has("ADMIN_PASSWORD") && has("ADMIN_SESSION_SECRET")) {
  console.log("Next: npm run dev → open http://localhost:3000/admin/login");
}
if (!smtpReady) {
  console.log("Then: fill SMTP_* and TO_EMAIL in .env.local for live inquiries.");
}
if (!supabaseReady) {
  console.log("For Vercel: create Supabase project and run supabase/schema.sql");
}

process.exitCode = has("ADMIN_PASSWORD") && has("ADMIN_SESSION_SECRET") ? 0 : 1;
