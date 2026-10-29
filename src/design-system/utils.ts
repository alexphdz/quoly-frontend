/** Une clases condicionales; cualquier valor que no sea un string no vacío se descarta. */
export function cx(...parts: unknown[]) {
  return parts.filter((p): p is string => typeof p === 'string' && p !== '').join(' ')
}
