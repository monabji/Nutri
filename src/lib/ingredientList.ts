/** Convert a pasted label into one clean ingredient per line. */
export function splitIngredients(value: string) {
  return value
    .split(/[\n,;]+/)
    .map((item) => item.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
}
