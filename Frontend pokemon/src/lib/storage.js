const FAVORITES_KEY = 'ptm-favorites'
const TEAM_FAVORITES_KEY = 'ptm-team-favorites'
const TEAMS_KEY = 'ptm-teams'
export const TEAM_LIMIT = 6

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getFavorites() {
  const parsed = readJson(FAVORITES_KEY, [])
  return Array.isArray(parsed) ? parsed : []
}

export function isFavorite(id) {
  return getFavorites().includes(id)
}

export function toggleFavorite(id) {
  const current = getFavorites()
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
  writeJson(FAVORITES_KEY, next)
  return next.includes(id)
}

export function getTeams() {
  const parsed = readJson(TEAMS_KEY, [])
  return Array.isArray(parsed) ? parsed : []
}

export function getTeamById(id) {
  return getTeams().find((team) => team.id === id)
}

export function createTeam(name) {
  const trimmed = name.trim()
  if (!trimmed) return undefined
  const team = { id: crypto.randomUUID(), name: trimmed, pokemonIds: [] }
  writeJson(TEAMS_KEY, [...getTeams(), team])
  return team
}

export function deleteTeam(id) {
  writeJson(
    TEAMS_KEY,
    getTeams().filter((team) => team.id !== id),
  )
  writeJson(
    TEAM_FAVORITES_KEY,
    getFavoriteTeams().filter((item) => item !== id),
  )
}

export function addPokemonToTeam(teamId, pokemonId) {
  const teams = getTeams()
  const team = teams.find((item) => item.id === teamId)
  if (!team) return { ok: false, full: false, duplicate: false }
  if (team.pokemonIds.includes(pokemonId)) return { ok: false, full: false, duplicate: true }
  if (team.pokemonIds.length >= TEAM_LIMIT) return { ok: false, full: true, duplicate: false }
  team.pokemonIds = [...team.pokemonIds, pokemonId]
  writeJson(TEAMS_KEY, teams)
  return { ok: true, full: false, duplicate: false }
}

export function removePokemonFromTeam(teamId, pokemonId) {
  const teams = getTeams()
  const team = teams.find((item) => item.id === teamId)
  if (!team) return
  team.pokemonIds = team.pokemonIds.filter((id) => id !== pokemonId)
  writeJson(TEAMS_KEY, teams)
}

export function getFavoriteTeams() {
  const parsed = readJson(TEAM_FAVORITES_KEY, [])
  return Array.isArray(parsed) ? parsed : []
}

export function isTeamFavorite(id) {
  return getFavoriteTeams().includes(id)
}

export function toggleTeamFavorite(id) {
  const current = getFavoriteTeams()
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
  writeJson(TEAM_FAVORITES_KEY, next)
  return next.includes(id)
}

export function clearAllData() {
  localStorage.removeItem(FAVORITES_KEY)
  localStorage.removeItem(TEAM_FAVORITES_KEY)
  localStorage.removeItem(TEAMS_KEY)
}
