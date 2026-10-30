/**
 * localStorage = geheugen van de browser (blijft na refresh).
 * ONTHOUDEN: alleen strings opslaan → JSON.stringify / JSON.parse
 */
import type { Team } from './types.ts'

const FAVORITES_KEY = 'ptm-favorites'
const TEAM_FAVORITES_KEY = 'ptm-team-favorites'
const TEAMS_KEY = 'ptm-teams'
export const TEAM_LIMIT = 6

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function readIds(key: string): number[] {
  const parsed = readJson<unknown>(key, [])
  if (!Array.isArray(parsed)) return []
  return parsed.filter((value): value is number => typeof value === 'number')
}

function readStringIds(key: string): string[] {
  const parsed = readJson<unknown>(key, [])
  if (!Array.isArray(parsed)) return []
  return parsed.filter((value): value is string => typeof value === 'string')
}

export function getFavorites(): number[] {
  return readIds(FAVORITES_KEY)
}

export function isFavorite(id: number): boolean {
  return getFavorites().includes(id)
}

export function toggleFavorite(id: number): boolean {
  const current = getFavorites()
  const next = current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id]
  writeJson(FAVORITES_KEY, next)
  return next.includes(id)
}

export function getTeams(): Team[] {
  const parsed = readJson<unknown>(TEAMS_KEY, [])
  if (!Array.isArray(parsed)) return []
  return parsed.filter(isTeam)
}

function isTeam(value: unknown): value is Team {
  if (!value || typeof value !== 'object') return false
  const team = value as Team
  return (
    typeof team.id === 'string' &&
    typeof team.name === 'string' &&
    Array.isArray(team.pokemonIds)
  )
}

function saveTeams(teams: Team[]): void {
  writeJson(TEAMS_KEY, teams)
}

export function getTeamById(id: string): Team | undefined {
  return getTeams().find((team) => team.id === id)
}

export function createTeam(name: string): Team | undefined {
  const trimmed = name.trim()
  if (!trimmed) return undefined
  const team: Team = {
    id: crypto.randomUUID(),
    name: trimmed,
    pokemonIds: [],
  }
  saveTeams([...getTeams(), team])
  return team
}

export function deleteTeam(id: string): void {
  saveTeams(getTeams().filter((team) => team.id !== id))
  writeJson(
    TEAM_FAVORITES_KEY,
    readStringIds(TEAM_FAVORITES_KEY).filter((item) => item !== id),
  )
}

export function addPokemonToTeam(
  teamId: string,
  pokemonId: number,
): { ok: boolean; full: boolean; duplicate: boolean } {
  const teams = getTeams()
  const team = teams.find((item) => item.id === teamId)
  if (!team) return { ok: false, full: false, duplicate: false }
  if (team.pokemonIds.includes(pokemonId)) {
    return { ok: false, full: false, duplicate: true }
  }
  if (team.pokemonIds.length >= TEAM_LIMIT) {
    return { ok: false, full: true, duplicate: false }
  }
  team.pokemonIds = [...team.pokemonIds, pokemonId]
  saveTeams(teams)
  return { ok: true, full: false, duplicate: false }
}

export function removePokemonFromTeam(teamId: string, pokemonId: number): void {
  const teams = getTeams()
  const team = teams.find((item) => item.id === teamId)
  if (!team) return
  team.pokemonIds = team.pokemonIds.filter((id) => id !== pokemonId)
  saveTeams(teams)
}

export function getFavoriteTeams(): string[] {
  return readStringIds(TEAM_FAVORITES_KEY)
}

export function isTeamFavorite(id: string): boolean {
  return getFavoriteTeams().includes(id)
}

export function toggleTeamFavorite(id: string): boolean {
  const current = getFavoriteTeams()
  const next = current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id]
  writeJson(TEAM_FAVORITES_KEY, next)
  return next.includes(id)
}

export function clearAllData(): void {
  localStorage.removeItem(FAVORITES_KEY)
  localStorage.removeItem(TEAM_FAVORITES_KEY)
  localStorage.removeItem(TEAMS_KEY)
  localStorage.removeItem('ptm-team')
}
