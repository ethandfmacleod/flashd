export function plural(str: string, count: number) {
  if (count === 1) return `1 ${str}`
  return `${count} ${str}s`
}
