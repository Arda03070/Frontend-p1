/**
 * i18n = internationalization (vertalen).
 * API geeft types in het Engels (fire). Wij tonen Vuur.
 *
 * ONTHOUDEN: Record<Sleutel, Waarde> = object waarbij élke sleutel gevuld moet zijn.
 */
import type { PokemonType } from './types.ts'

export const TYPE_LABELS: Record<PokemonType, string> = {
  normal: 'Normaal',
  fire: 'Vuur',
  water: 'Water',
  electric: 'Elektrisch',
  grass: 'Gras',
  ice: 'IJs',
  fighting: 'Vecht',
  poison: 'Gif',
  ground: 'Grond',
  flying: 'Vlieg',
  psychic: 'Psycho',
  bug: 'Insect',
  rock: 'Steen',
  ghost: 'Geest',
  dragon: 'Draak',
  dark: 'Duister',
  steel: 'Staal',
  fairy: 'Fee',
}

/** Eerste letter hoofdletter: pikachu → Pikachu */
export function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

/** Meer types: Gras / Gif */
export function formatTypes(types: PokemonType[]): string {
  return types.map((type) => TYPE_LABELS[type]).join(' / ')
}

/** 1 → "001" (Pokédex-nummer). padStart vult links aan. */
export function padId(id: number): string {
  return String(id).padStart(3, '0')
}
