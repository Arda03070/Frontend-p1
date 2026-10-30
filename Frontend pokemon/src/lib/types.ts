/**
 * TYPES = de "vorm" van data. Geen runtime-code, alleen voor TypeScript.
 *
 * ONTHOUDEN:
 * - type = afspraak: "een Pokémon heeft altijd een id, name, types, ..."
 * - Als je pokemon.naam typt i.p.v. pokemon.name, geeft de editor een fout.
 * - import type { Pokemon } from './types.ts'  → alleen types, geen extra JS
 */

// | betekent OF. Een type is één van deze strings, niks anders.
export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy'

// Object-type: velden met een type erachter.
export type PokemonStats = {
  hp: number
  attack: number
  defense: number
  speed: number
}

export type Pokemon = {
  id: number
  name: string
  types: PokemonType[] // [] = array (lijst)
  sprite: string // URL naar de afbeelding
  stats: PokemonStats
}

// & = uitbreiden: alles van Pokemon + extra velden.
export type PokemonDetail = Pokemon & {
  height: number
  weight: number
  description: string
}

/** Een team dat jij aanmaakt. pokemonIds = max 6 Pokémon-nummers. */
export type Team = {
  id: string
  name: string
  pokemonIds: number[]
}
