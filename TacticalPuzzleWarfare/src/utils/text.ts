// React Native's `textTransform: 'uppercase'` is not locale-aware and turns
// Turkish lowercase "i" into ASCII "I" instead of "İ" (and drops other
// Turkish casing rules). Always uppercase Turkish strings through this
// helper instead of relying on the CSS transform.
export function trUpper(text: string): string {
  return text.toLocaleUpperCase('tr-TR');
}
