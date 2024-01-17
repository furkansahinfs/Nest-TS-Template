export function generateProductWhereIdString(productIdParam: string) {
  const ids = productIdParam.split(",");

  return ids?.length > 1
    ? `id in (${createWhereStringForInPredicate(ids)})`
    : `id="${productIdParam}"`;
}

function createWhereStringForInPredicate(predicateStringArr: string[]) {
  const predicateStringsWithQuote = '"' + predicateStringArr.join('", "') + '"';

  return predicateStringsWithQuote;
}
