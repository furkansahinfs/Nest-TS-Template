export function minuteBetween(date1: Date, date2: Date): number {
  const millis = date1.getMilliseconds() - date2.getMilliseconds();

  return Math.floor(millis / (1000 * 60));
}
