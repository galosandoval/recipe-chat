export function buildGenerateRecipeContent(
  prefix: string,
  name: string,
  description: string
) {
  return `${prefix} ${name}: ${description}`
}
