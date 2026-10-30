/**
 * PAGINA'S
 * 1. HTML maken  2. innerHTML  3. addEventListener
 */
import { getPokemonById, getPokemonByIds, getPokemonList } from './lib/api.ts'
import { capitalize, formatTypes, padId, TYPE_LABELS } from './lib/i18n.ts'
import {
  addPokemonToTeam,
  clearAllData,
  createTeam,
  deleteTeam,
  getFavoriteTeams,
  getFavorites,
  getTeamById,
  getTeams,
  isFavorite,
  isTeamFavorite,
  removePokemonFromTeam,
  TEAM_LIMIT,
  toggleFavorite,
  toggleTeamFavorite,
} from './lib/storage.ts'
import type { Pokemon, PokemonType, Team } from './lib/types.ts'
import { emptyState, loading, nav, page, pokemonCard } from './ui.ts'

function listControls(query: string, filter: string, type: string, types: PokemonType[]): string {
  const typeOptions = types
    .map(
      (value) =>
        `<option value="${value}" ${type === value ? 'selected' : ''}>${TYPE_LABELS[value]}</option>`,
    )
    .join('')

  return `
    <div class="toolbar">
      <label class="search">
        <span class="sr-only">Zoek een Pokémon</span>
        <input id="search" type="search" placeholder="Zoek een Pokémon..." value="${query}" />
      </label>
      <div class="filters">
        <button type="button" data-filter="all" class="${filter === 'all' ? 'is-active' : ''}">Alle</button>
        <button type="button" data-filter="favorites" class="${filter === 'favorites' ? 'is-active' : ''}">Favorieten</button>
        <select id="type-filter">
          <option value="">Type</option>
          ${typeOptions}
        </select>
      </div>
    </div>
  `
}

function applyFilters(
  pokemon: Pokemon[],
  query: string,
  filter: string,
  type: string,
): Pokemon[] {
  const favorites = new Set(getFavorites())
  return pokemon.filter((item) => {
    const matchesQuery = item.name.includes(query.toLowerCase().trim())
    const matchesFav = filter !== 'favorites' || favorites.has(item.id)
    const matchesType = !type || item.types.includes(type as PokemonType)
    return matchesQuery && matchesFav && matchesType
  })
}

function teamCard(team: Team): string {
  const fav = isTeamFavorite(team.id)
  return `
    <article class="team-card">
      <div>
        <h3>${team.name}</h3>
        <p>${team.pokemonIds.length} / ${TEAM_LIMIT} Pokémon</p>
      </div>
      <div class="actions">
        <a class="btn" href="/team/${team.id}">Bekijk</a>
        <button type="button" class="btn btn--ghost" data-fav-team="${team.id}">${fav ? '★ Favoriet' : '☆ Favoriet'}</button>
        <button type="button" class="btn btn--ghost" data-delete-team="${team.id}">Verwijder</button>
      </div>
    </article>
  `
}

export function renderHome(root: HTMLElement): void {
  root.innerHTML = page(
    'home',
    `
      <section class="hero-panel">
        <div class="hero-art" aria-hidden="true">
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" alt="" />
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png" alt="" />
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png" alt="" />
        </div>
        <h1>Welkom bij Pokemon Team Manager!</h1>
        <p>Beheer je teams, bekijk Pokémon en voeg je favorieten toe.</p>
      </section>
      <section class="quick-grid">
        <a class="quick-card" href="/team">
          <span class="quick-icon">👤</span>
          <span>Mijn Teams</span>
          <span class="chevron">›</span>
        </a>
        <a class="quick-card" href="/pokemon">
          <span class="quick-icon"><span class="pokeball" aria-hidden="true"></span></span>
          <span>Bekijk Pokémon</span>
          <span class="chevron">›</span>
        </a>
        <a class="quick-card" href="/favorieten">
          <span class="quick-icon">★</span>
          <span>Favorieten</span>
          <span class="chevron">›</span>
        </a>
        <a class="quick-card" href="/instellingen">
          <span class="quick-icon">⚙</span>
          <span>Instellingen</span>
          <span class="chevron">›</span>
        </a>
      </section>
    `,
  )
}

export async function renderList(root: HTMLElement): Promise<void> {
  root.innerHTML = `${nav('pokemon')}<main class="page">${loading('Pokémon laden...')}</main>`

  let all: Pokemon[]
  try {
    all = await getPokemonList()
  } catch {
    root.querySelector('main')!.innerHTML = emptyState(
      'De Pokédex kon niet geladen worden. Probeer later opnieuw.',
    )
    return
  }

  const types = [...new Set(all.flatMap((item) => item.types))].sort()
  let query = ''
  let filter = 'all'
  let type = ''

  const paint = () => {
    const items = applyFilters(all, query, filter, type)
    const cards = items
      .map((pokemon) =>
        pokemonCard(pokemon, `<a class="btn" href="/pokemon/${pokemon.id}">Bekijk</a>`),
      )
      .join('')

    root.innerHTML = page(
      'pokemon',
      `
        <h1>Pokémon Lijst</h1>
        ${listControls(query, filter, type, types)}
        ${
          items.length
            ? `<section class="grid">${cards}</section>`
            : emptyState('Geen Pokémon gevonden.')
        }
      `,
    )

    const search = root.querySelector<HTMLInputElement>('#search')
    search?.addEventListener('input', () => {
      query = search.value
      paint()
      const input = root.querySelector<HTMLInputElement>('#search')
      input?.focus()
      if (input) input.setSelectionRange(query.length, query.length)
    })

    root.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        filter = button.dataset.filter ?? 'all'
        paint()
      })
    })

    root.querySelector<HTMLSelectElement>('#type-filter')?.addEventListener('change', (event) => {
      type = (event.target as HTMLSelectElement).value
      paint()
    })
  }

  paint()
}

export async function renderDetail(root: HTMLElement, id: number): Promise<void> {
  root.innerHTML = `${nav('pokemon')}<main class="page">${loading('Gegevens laden...')}</main>`

  try {
    const pokemon = await getPokemonById(id)
    const favorite = isFavorite(pokemon.id)
    const teams = getTeams()
    const options = teams
      .map((team) => `<option value="${team.id}">${team.name}</option>`)
      .join('')

    root.innerHTML = page(
      'pokemon',
      `
        <section class="detail">
          <div class="detail__art">
            <img src="${pokemon.sprite}" alt="${capitalize(pokemon.name)}" />
          </div>
          <div class="detail__body">
            <div class="detail__heading">
              <h1>${capitalize(pokemon.name)}</h1>
              <p class="muted">${formatTypes(pokemon.types)}</p>
              <span class="badge">#${padId(pokemon.id)}</span>
            </div>
            <h2>Basis informatie</h2>
            <dl class="stats">
              <div><dt>HP</dt><dd>${pokemon.stats.hp}</dd></div>
              <div><dt>Aanval</dt><dd>${pokemon.stats.attack}</dd></div>
              <div><dt>Verdediging</dt><dd>${pokemon.stats.defense}</dd></div>
              <div><dt>Snelheid</dt><dd>${pokemon.stats.speed}</dd></div>
            </dl>
            <h2>Beschrijving</h2>
            <p>${pokemon.description || 'Geen beschrijving beschikbaar.'}</p>
            <div class="actions">
              <button type="button" class="btn" id="fav-btn">${favorite ? '★ Verwijder uit favorieten' : '☆ Toevoegen aan favorieten'}</button>
            </div>
            <div class="team-add">
              ${
                teams.length
                  ? `
                    <label>
                      <span class="sr-only">Kies een team</span>
                      <select id="team-select">${options}</select>
                    </label>
                    <button type="button" class="btn" id="team-btn">Toevoegen aan team</button>
                  `
                  : `<a class="btn" href="/team">Maak eerst een team</a>`
              }
            </div>
            <p class="hint" id="hint" hidden></p>
            <a class="back" href="/pokemon">‹ Terug naar lijst</a>
          </div>
        </section>
      `,
    )

    const hint = root.querySelector<HTMLElement>('#hint')!

    root.querySelector('#fav-btn')?.addEventListener('click', (event) => {
      const added = toggleFavorite(pokemon.id)
      ;(event.currentTarget as HTMLButtonElement).textContent = added
        ? '★ Verwijder uit favorieten'
        : '☆ Toevoegen aan favorieten'
    })

    root.querySelector('#team-btn')?.addEventListener('click', () => {
      const teamId = root.querySelector<HTMLSelectElement>('#team-select')?.value
      if (!teamId) return
      const result = addPokemonToTeam(teamId, pokemon.id)
      hint.hidden = false
      if (result.ok) {
        hint.textContent = 'Toegevoegd aan team.'
      } else if (result.full) {
        hint.textContent = `Dit team is vol (max ${TEAM_LIMIT}).`
      } else if (result.duplicate) {
        hint.textContent = 'Deze Pokémon zit al in dit team.'
      } else {
        hint.textContent = 'Team niet gevonden.'
      }
    })
  } catch {
    root.querySelector('main')!.innerHTML = emptyState('Deze Pokémon kon niet geladen worden.')
  }
}

function bindTeamListActions(root: HTMLElement, redraw: () => void): void {
  root.querySelectorAll<HTMLButtonElement>('[data-delete-team]').forEach((button) => {
    button.addEventListener('click', () => {
      deleteTeam(button.dataset.deleteTeam ?? '')
      redraw()
    })
  })
  root.querySelectorAll<HTMLButtonElement>('[data-fav-team]').forEach((button) => {
    button.addEventListener('click', () => {
      toggleTeamFavorite(button.dataset.favTeam ?? '')
      redraw()
    })
  })
}

export function renderTeamList(root: HTMLElement): void {
  const paint = () => {
    const teams = getTeams()
    root.innerHTML = page(
      'team',
      `
        <h1>Mijn Teams</h1>
        <form class="create-bar" id="create-team">
          <label>
            <span class="sr-only">Teamnaam</span>
            <input name="name" type="text" placeholder="Nieuwe teamnaam..." required />
          </label>
          <button class="btn" type="submit">Team aanmaken</button>
        </form>
        ${
          teams.length
            ? `<section class="team-list">${teams.map(teamCard).join('')}</section>`
            : emptyState('Je hebt nog geen teams. Maak hierboven je eerste team.')
        }
      `,
    )

    root.querySelector<HTMLFormElement>('#create-team')?.addEventListener('submit', (event) => {
      event.preventDefault()
      const form = event.currentTarget as HTMLFormElement
      const input = form.elements.namedItem('name') as HTMLInputElement
      createTeam(input.value)
      paint()
    })

    bindTeamListActions(root, paint)
  }

  paint()
}

export async function renderTeamDetail(root: HTMLElement, id: string): Promise<void> {
  const team = getTeamById(id)
  if (!team) {
    root.innerHTML = page('team', emptyState('Dit team bestaat niet.') + `<a class="back" href="/team">‹ Terug naar teams</a>`)
    return
  }

  root.innerHTML = `${nav('team')}<main class="page">${loading('Team laden...')}</main>`
  const members = await getPokemonByIds(team.pokemonIds)
  const fav = isTeamFavorite(team.id)

  const slots = Array.from({ length: TEAM_LIMIT }, (_, index) => {
    const pokemon = members[index]
    if (!pokemon) return `<article class="slot">Lege plek</article>`
    return pokemonCard(
      pokemon,
      `<a class="btn" href="/pokemon/${pokemon.id}">Bekijk</a>
       <button type="button" class="btn btn--ghost" data-remove="${pokemon.id}">Verwijder</button>`,
    )
  }).join('')

  root.innerHTML = page(
    'team',
    `
      <h1>${team.name}</h1>
      <p class="lede">Maximaal ${TEAM_LIMIT} Pokémon in dit team.</p>
      <div class="actions">
        <button type="button" class="btn" id="fav-team">${fav ? '★ Verwijder uit favorieten' : '☆ Team favoriet maken'}</button>
        <button type="button" class="btn btn--ghost" id="delete-team">Team verwijderen</button>
      </div>
      <section class="grid">${slots}</section>
      ${members.length === 0 ? emptyState('Dit team is nog leeg. Voeg Pokémon toe via een detailpagina.') : ''}
      <a class="back" href="/team">‹ Terug naar teams</a>
    `,
  )

  root.querySelector('#fav-team')?.addEventListener('click', () => {
    toggleTeamFavorite(team.id)
    void renderTeamDetail(root, id)
  })

  root.querySelector('#delete-team')?.addEventListener('click', () => {
    deleteTeam(team.id)
    history.pushState({}, '', '/team')
    renderTeamList(root)
  })

  root.querySelectorAll<HTMLButtonElement>('[data-remove]').forEach((button) => {
    button.addEventListener('click', () => {
      removePokemonFromTeam(team.id, Number(button.dataset.remove))
      void renderTeamDetail(root, id)
    })
  })
}

export async function renderFavorites(root: HTMLElement): Promise<void> {
  root.innerHTML = `${nav('favorieten')}<main class="page">${loading('Favorieten laden...')}</main>`
  const pokemon = await getPokemonByIds(getFavorites())
  const teams = getTeams().filter((team) => getFavoriteTeams().includes(team.id))

  const pokeCards = pokemon
    .map((item) => pokemonCard(item, `<a class="btn" href="/pokemon/${item.id}">Bekijk</a>`))
    .join('')

  root.innerHTML = page(
    'favorieten',
    `
      <h1>Favorieten</h1>
      <h2>Pokémon</h2>
      ${pokemon.length ? `<section class="grid">${pokeCards}</section>` : emptyState('Nog geen favoriete Pokémon.')}
      <h2>Teams</h2>
      ${teams.length ? `<section class="team-list">${teams.map(teamCard).join('')}</section>` : emptyState('Nog geen favoriete teams.')}
    `,
  )

  bindTeamListActions(root, () => {
    void renderFavorites(root)
  })
}

export function renderSettings(root: HTMLElement): void {
  root.innerHTML = page(
    'home',
    `
      <h1>Instellingen</h1>
      <p class="lede">Wis opgeslagen favorieten en teams van dit apparaat.</p>
      <button type="button" class="btn" id="reset">Alles wissen</button>
      <p class="hint" id="hint" hidden>Gegevens gewist.</p>
    `,
  )

  root.querySelector('#reset')?.addEventListener('click', () => {
    clearAllData()
    const hint = root.querySelector<HTMLElement>('#hint')
    if (hint) hint.hidden = false
  })
}
