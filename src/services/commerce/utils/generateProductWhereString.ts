import { createWhereStringForInPredicate } from "./createWhereStringForInPredicate";

export function generateProductWhereIdString(productIdParam: string): string {
  const ids = productIdParam.split(",");

  return ids?.length > 1
    ? `id in (${createWhereStringForInPredicate(ids)})`
    : `id="${productIdParam}"`;
}
