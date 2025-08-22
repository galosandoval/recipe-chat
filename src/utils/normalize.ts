export function normalize(name: string) {
  return name
    .toLowerCase()
    .normalize('NFKD') // split accents
    .replace(/\p{Diacritic}/gu, '') // remove accents
    .replace(/[^a-z0-9]+/g, ' ') // keep letters/digits
    .trim()
}
