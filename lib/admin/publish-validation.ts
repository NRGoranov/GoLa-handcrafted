import type { ContentSectionFormValues } from "@/lib/content/section-schema";
import type { ProductRecordInput } from "@/types/product-record";

export type PublishIssue = {
  fieldId: string;
  label: string;
  message: string;
};

const IMAGE_LAYOUTS = new Set<ContentSectionFormValues["layout"]>([
  "split-left",
  "split-right",
  "centered",
  "full-bleed"
]);

function pushIf(
  issues: PublishIssue[],
  condition: boolean,
  issue: PublishIssue
) {
  if (condition) issues.push(issue);
}

export function validateSectionForPublish(values: ContentSectionFormValues): PublishIssue[] {
  const issues: PublishIssue[] = [];
  const slug = values.slug.trim();

  pushIf(issues, !slug, {
    fieldId: "field-slug",
    label: "Slug",
    message: "Needed for menu link (#anchor)."
  });
  pushIf(issues, Boolean(slug) && !/^[a-z0-9-]+$/.test(slug), {
    fieldId: "field-slug",
    label: "Slug",
    message: "Use lowercase letters, numbers, hyphens only."
  });

  pushIf(issues, !values.title.en.trim(), {
    fieldId: "field-title-en",
    label: "English title",
    message: "Appears in the English menu."
  });
  pushIf(issues, !values.title.bg.trim(), {
    fieldId: "field-title-bg",
    label: "Bulgarian title",
    message: "Appears in the Bulgarian menu."
  });

  pushIf(issues, !values.description.en.trim(), {
    fieldId: "field-description-en",
    label: "English description",
    message: "Shown under the heading on /en."
  });
  pushIf(issues, !values.description.bg.trim(), {
    fieldId: "field-description-bg",
    label: "Bulgarian description",
    message: "Shown under the heading on /bg."
  });

  if (IMAGE_LAYOUTS.has(values.layout)) {
    pushIf(issues, !values.imageUrl?.trim(), {
      fieldId: "field-image",
      label: "Section image",
      message: "This layout needs a photo."
    });
    if (values.imageUrl?.trim()) {
      pushIf(issues, !values.imageAlt.en.trim(), {
        fieldId: "field-imageAlt-en",
        label: "English alt text",
        message: "Describes the image for accessibility."
      });
      pushIf(issues, !values.imageAlt.bg.trim(), {
        fieldId: "field-imageAlt-bg",
        label: "Bulgarian alt text",
        message: "Describes the image for accessibility."
      });
    }
  }

  if (values.ctaHref?.trim()) {
    pushIf(issues, !values.ctaLabel.en.trim() && !values.ctaLabel.bg.trim(), {
      fieldId: "field-ctaLabel-en",
      label: "CTA button label",
      message: "Add a label for the link button."
    });
  }

  return issues;
}

export function validateProductForPublish(values: ProductRecordInput): PublishIssue[] {
  const issues: PublishIssue[] = [];

  pushIf(issues, !values.name.en.trim(), {
    fieldId: "field-product-name-en",
    label: "English name",
    message: "Shown on the catalog card in English."
  });
  pushIf(issues, !values.name.bg.trim(), {
    fieldId: "field-product-name-bg",
    label: "Bulgarian name",
    message: "Shown on the catalog card in Bulgarian."
  });

  pushIf(issues, !values.cardSummary.en.trim(), {
    fieldId: "field-product-summary-en",
    label: "English card summary",
    message: "Short text on the homepage card."
  });
  pushIf(issues, !values.cardSummary.bg.trim(), {
    fieldId: "field-product-summary-bg",
    label: "Bulgarian card summary",
    message: "Short text on the homepage card."
  });

  pushIf(issues, !values.priceEur || values.priceEur <= 0, {
    fieldId: "field-product-price",
    label: "Price",
    message: "Set a price before going live."
  });

  pushIf(issues, values.images.length === 0, {
    fieldId: "field-product-images",
    label: "Product photos",
    message: "At least one image is required."
  });

  return issues;
}

export function scrollToPublishField(fieldId: string) {
  const target = document.getElementById(fieldId);
  if (!target) return;

  target.scrollIntoView({ behavior: "smooth", block: "center" });
  const focusable = target.querySelector<HTMLElement>("input, textarea, select, button");
  focusable?.focus({ preventScroll: true });
}

export function publishIssueFieldIds(issues: PublishIssue[]): Set<string> {
  return new Set(issues.map((issue) => issue.fieldId));
}
