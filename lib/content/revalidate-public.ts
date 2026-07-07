import { revalidatePath } from "next/cache";

/** Bust cached homepage HTML after CMS catalog changes. */
export function revalidatePublicHomepages() {
  revalidatePath("/");
  revalidatePath("/en");
  revalidatePath("/bg");
}
