export function createWhereStringForInPredicate(
  predicateStringArr: string[],
): string {
  const predicateStringsWithQuote = '"' + predicateStringArr.join('", "') + '"';

  return predicateStringsWithQuote;
}
