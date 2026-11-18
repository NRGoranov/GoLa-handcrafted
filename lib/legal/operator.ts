/**
 * Facts this repository already publishes, plus trader-identity fields that
 * only the operator can supply. Empty env values stay empty. Do not invent
 * a company number, VAT ID, or registered address.
 */

export type OperatorProfile = {
  tradeName: string;
  siteUrl: string;
  phones: readonly string[];
  legalName: string | null;
  address: string | null;
  uic: string | null;
  vatId: string | null;
  email: string | null;
  /** true = advertised EUR amounts include VAT; false = VAT is not charged; null = not configured. */
  pricesIncludeVat: boolean | null;
};

function readEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function pricesIncludeVat(): boolean | null {
  const raw = (process.env.NEXT_PUBLIC_PRICE_INCLUDES_VAT ?? "").trim().toLowerCase();
  if (raw === "true" || raw === "1" || raw === "yes") return true;
  if (raw === "false" || raw === "0" || raw === "no") return false;
  return null;
}

export function getOperator(): OperatorProfile {
  return {
    tradeName: "Gola Handcrafted",
    siteUrl: "https://www.gola-handcrafted.eu",
    phones: ["+359887509906", "+359887297480"],
    legalName: readEnv("LEGAL_ENTITY_NAME"),
    address: readEnv("LEGAL_ADDRESS"),
    uic: readEnv("LEGAL_UIC"),
    vatId: readEnv("LEGAL_VAT_ID"),
    email: readEnv("PUBLIC_CONTACT_EMAIL"),
    pricesIncludeVat: pricesIncludeVat()
  };
}

export type IdentityGap = "legalName" | "address" | "uic" | "email";

/** Fields an EU information-society service must keep easy to find. VAT ID is required only when registered. */
export function missingIdentityFields(operator: OperatorProfile): IdentityGap[] {
  const gaps: IdentityGap[] = [];
  if (!operator.legalName) gaps.push("legalName");
  if (!operator.address) gaps.push("address");
  if (!operator.uic) gaps.push("uic");
  if (!operator.email) gaps.push("email");
  return gaps;
}
