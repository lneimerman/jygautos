export type Category = 'auto' | 'moto' | 'cuatriciclo' | 'trailer';

export const CATEGORIES: { value: Category; label: string; plural: string }[] = [
  { value: 'auto', label: 'Auto', plural: 'Autos' },
  { value: 'moto', label: 'Moto', plural: 'Motos' },
  { value: 'cuatriciclo', label: 'Cuatriciclo', plural: 'Cuatriciclos' },
  { value: 'trailer', label: 'Trailer', plural: 'Trailers' },
];

export function parseCategory(v: string | null | undefined): Category | null {
  return CATEGORIES.find((c) => c.value === v)?.value ?? null;
}
