export function mergeBuiltinSectionCopy<T extends object>(
  base: T,
  override: Record<string, unknown>
): T {
  const result = { ...base } as Record<string, unknown>;

  for (const [key, value] of Object.entries(override)) {
    if (value === undefined || value === null) continue;

    const existing = result[key];
    if (
      Array.isArray(value) ||
      typeof value !== "object" ||
      !existing ||
      typeof existing !== "object" ||
      Array.isArray(existing)
    ) {
      result[key] = value;
      continue;
    }

    result[key] = mergeBuiltinSectionCopy(existing as object, value as Record<string, unknown>);
  }

  return result as T;
}
