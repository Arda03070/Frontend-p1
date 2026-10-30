/**
 * API-laag: praten met https://pokeapi.co
 *
 * ONTHOUDEN:
 * - fetch(url) = data van internet ophalen. Geeft een Promise.
 * - await = wacht tot de Promise klaar is.
 * - response.json() = tekst omzetten naar een JavaScript-object.
 * - Promise.all([...]) = meerdere requests TEGELIJK, wacht tot ze allemaal klaar zijn.
 *
 * Docs om te oefenen: https://pokeapi.co/docs/v2
 */
import type { Pokemon, PokemonDetail, PokemonStats, PokemonType } from './types.ts'

const LIST_CACHE_KEY = 'ptm-gen1-cache'
const API = 'https://pokeapi.co/api/v2'

/** Zo ziet de API een "naam + url" (niet onze eigen Pokemon-type). */
type NamedApiResource = {
  name: string
  url: string
}

/** Ruwe JSON van /pokemon/:id — groter dan wij nodig hebben. */
type PokemonApi = {
  id: number
  name: string
  height: number
  weight: number
  types: { type: NamedApiResource }[]
  stats: { base_stat: number; stat: NamedApiResource }[]
  sprites: {
    other?: {
      'official-artwork'?: {
        front_default: string | null
      }
    }
    front_default: string | null
  }
}

type SpeciesApi = {
  flavor_text_entries: {
    flavor_text: string
    language: NamedApiResource
  }[]
}

function spriteFrom(data: PokemonApi): string {
  // ?. = optional chaining: crash niet als een veld ontbreekt.
  // ?? = nullish coalescing: gebruik rechts als links null/undefined is.
  return (
    data.sprites.other?.['official-artwork']?.front_default ??
    data.sprites.front_default ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`
  )
}

function statsFrom(data: PokemonApi): PokemonStats {
  // Array van {stat, waarde} → object { hp: 45, attack: 49, ... }
  const map = Object.fromEntries(data.stats.map((entry) => [entry.stat.name, entry.base_stat]))
  return {
    hp: map.hp ?? 0,
    attack: map.attack ?? 0,
    defense: map.defense ?? 0,
    speed: map.speed ?? 0,
  }
}

function typesFrom(data: PokemonApi): PokemonType[] {
  // as PokemonType: wij beloven dat de API-string in ons type past.
  return data.types.map((entry) => entry.type.name as PokemonType)
}

/** API-data omzetten naar óns nette Pokemon-object. */
function toPokemon(data: PokemonApi): Pokemon {
  return {
    id: data.id,
    name: data.name,
    types: typesFrom(data),
    sprite: spriteFrom(data),
    stats: statsFrom(data),
  }
}

/**
 * Generieke helper. <T> = "vertel later welk type JSON je verwacht".
 * Voorbeeld: fetchJson<PokemonApi>(url)
 */
async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  // ok is false bij 404, 500, etc.
  if (!response.ok) {
    throw new Error(`Kon data niet laden (${response.status})`)
  }
  return response.json() as Promise<T>
}

export async function getPokemonList(): Promise<Pokemon[]> {
  // Cache: 151 Pokémon niet elke keer opnieuw downloaden in dezelfde tab.
  const cached = sessionStorage.getItem(LIST_CACHE_KEY)
  if (cached) {
    return JSON.parse(cached) as Pokemon[]
  }

  // Eerst alleen namen + urls, daarna van elke url de details.
  const list = await fetchJson<{ results: NamedApiResource[] }>(`${API}/pokemon?limit=151`)
  const details = await Promise.all(
    list.results.map((item) => fetchJson<PokemonApi>(item.url)),
  )
  const pokemon = details.map(toPokemon)

  sessionStorage.setItem(LIST_CACHE_KEY, JSON.stringify(pokemon))
  return pokemon
}

export async function getPokemonById(id: number): Promise<PokemonDetail> {
  // Twee endpoints tegelijk: stats/sprite én beschrijving.
  const [data, species] = await Promise.all([
    fetchJson<PokemonApi>(`${API}/pokemon/${id}`),
    fetchJson<SpeciesApi>(`${API}/pokemon-species/${id}`),
  ])

  // .find zoekt het eerste item dat aan de voorwaarde voldoet.
  const dutch = species.flavor_text_entries.find((entry) => entry.language.name === 'nl')
  const english = species.flavor_text_entries.find((entry) => entry.language.name === 'en')
  // Game-teksten hebben rare enters (\f). Die maken we spaties.
  const description = (dutch ?? english)?.flavor_text.replace(/[\f\n\r]/g, ' ').trim() ?? ''

  return {
    ...toPokemon(data), // spread: kopieer alle velden van toPokemon
    height: data.height,
    weight: data.weight,
    description,
  }
}

export async function getPokemonByIds(ids: number[]): Promise<Pokemon[]> {
  if (ids.length === 0) return []
  const list = await getPokemonList()
  // Map = snelle lookup: id → pokemon (in plaats van steeds .find).
  const byId = new Map(list.map((item) => [item.id, item]))
  return ids.map((id) => byId.get(id)).filter((item): item is Pokemon => Boolean(item))
}
