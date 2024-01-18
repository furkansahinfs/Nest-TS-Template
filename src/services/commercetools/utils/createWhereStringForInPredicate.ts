export function createWhereStringForInPredicate(predicateStringArr: string[]) {
  const predicateStringsWithQuote = '"' + predicateStringArr.join('", "') + '"';

  return predicateStringsWithQuote;
}
