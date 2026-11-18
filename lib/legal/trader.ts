/**
 * Identity that is already public on the site.
 * Directive 2000/31/EC Art. 5 and the Bulgarian Electronic Commerce Act
 * also require a legal name, geographic address, email, trade-register
 * number (ЕИК), and VAT ID when one exists. Leave a field "" until the
 * real value is known. Do not invent one.
 */
export const trader = {
  brand: "Gola Handcrafted",
  website: "https://www.gola-handcrafted.eu",
  established: "Bulgaria",
  phones: ["+359887509906", "+359887297480"],
  email: "",
  legalName: "",
  postalAddress: "",
  registryId: "",
  vatId: "",
} as const;

/**
 * null = VAT treatment is not declared, so the site must not say "incl. VAT".
 * true = the stored euro amount already includes VAT.
 * false = VAT is not charged on these prices.
 */
export const priceVatIncluded: boolean | null = null;

export const privacyUpdated = "18 November 2026";
