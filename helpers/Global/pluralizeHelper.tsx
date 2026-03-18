/**
 * Agrega un sufijo de pluralización (S) o (ES) a una unidad de medida según la gramática española.
 * @param unit La unidad de medida (ej: "LIBRA", "UNIDAD", "CAJA")
 * @returns El texto con el sufijo (ej: "LIBRA(S)", "UNIDAD(ES)")
 */
export const formatUnitPlural = (unit: string | null | undefined): string => {
  if (!unit) return '';
  const trimmed = unit.trim();
  if (!trimmed) return '';

  const lastChar = trimmed.charAt(trimmed.length - 1).toLowerCase();
  const vowels = ['a', 'e', 'i', 'o', 'u'];

  if (vowels.includes(lastChar)) {
    return `${trimmed}(S)`;
  } else {
    return `${trimmed}(ES)`;
  }
};
