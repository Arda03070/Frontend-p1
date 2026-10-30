/**
 * UI-bouwstenen: HTML-strings die we op meerdere pagina's hergebruiken.
 */
import { capitalize, formatTypes } from './lib/i18n.ts'
import type { Pokemon } from './lib/types.ts'

export function nav(active: 'home' | 'pokemon' | 'favorieten' | 'team'): string {
  const link = (href: string, key: typeof active, label: string) =>
    `<a href="${href}" class="${active === key ? 'is-active' : ''}">${label}</a>`

  return `
    <header class="topbar">
      <a class="brand" href="/">Pokemon Team Manager</a>
      <nav>
        ${link('/', 'home', 'Home')}
        ${link('/pokemon', 'pokemon', 'Pokémon')}
        ${link('/favorieten', 'favorieten', 'Favorieten')}
        ${link('/team', 'team', 'Team')}
      </nav>
    </header>
  `
}

export function pokemonCard(pokemon: Pokemon, extra = ''): string {
  return `
    <article class="poke-card">
      <div class="poke-card__art">
        <img src="${pokemon.sprite}" alt="${capitalize(pokemon.name)}" />
      </div>
      <h3>${capitalize(pokemon.name)}</h3>
      <p>${formatTypes(pokemon.types)}</p>
      ${extra}
    </article>
  `
}

export function loading(message: string): string {
  return `<div class="state">${message}</div>`
}

export function emptyState(message: string): string {
  return `<div class="state state--empty">${message}</div>`
}

export function page(active: Parameters<typeof nav>[0], content: string): string {
  return `${nav(active)}<main class="page">${content}</main>`
}
