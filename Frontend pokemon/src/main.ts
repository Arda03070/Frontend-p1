/**
 * STARTPUNT + ROUTING
 *
 * Dynamic routing (opdracht): de URL heeft een wisselend stuk.
 *   /pokemon/25     → :id is 25 (Pikachu)
 *   /team/abc-123   → :id is het team-id
 *
 * ONTHOUDEN:
 * - pathname = het pad na de domeinnaam (/pokemon/25)
 * - history.pushState = URL veranderen ZONDER de pagina te herladen
 * - popstate = terug/vooruit-knop van de browser
 */
import './style.css'
import {
  renderDetail,
  renderFavorites,
  renderHome,
  renderList,
  renderSettings,
  renderTeamDetail,
  renderTeamList,
} from './pages.ts'

const app = document.querySelector<HTMLDivElement>('#app')!

type Route =
  | { name: 'home' }
  | { name: 'list' }
  | { name: 'detail'; id: number }
  | { name: 'favorites' }
  | { name: 'teams' }
  | { name: 'team'; id: string }
  | { name: 'settings' }

function parseRoute(): Route {
  const parts = window.location.pathname.split('/').filter(Boolean)

  if (parts.length === 0) return { name: 'home' }
  if (parts[0] === 'pokemon' && parts[1]) return { name: 'detail', id: Number(parts[1]) }
  if (parts[0] === 'pokemon') return { name: 'list' }
  if (parts[0] === 'favorieten') return { name: 'favorites' }
  if (parts[0] === 'team' && parts[1]) return { name: 'team', id: parts[1] }
  if (parts[0] === 'team') return { name: 'teams' }
  if (parts[0] === 'instellingen') return { name: 'settings' }
  return { name: 'home' }
}

async function render(): Promise<void> {
  const route = parseRoute()
  switch (route.name) {
    case 'list':
      await renderList(app)
      break
    case 'detail':
      await renderDetail(app, route.id)
      break
    case 'favorites':
      await renderFavorites(app)
      break
    case 'teams':
      renderTeamList(app)
      break
    case 'team':
      await renderTeamDetail(app, route.id)
      break
    case 'settings':
      renderSettings(app)
      break
    default:
      renderHome(app)
  }
}

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement | null
  const anchor = target?.closest('a')
  if (!anchor || anchor.target === '_blank' || event.metaKey || event.ctrlKey) return
  if (anchor.origin !== window.location.origin) return
  event.preventDefault()
  const next = `${anchor.pathname}${anchor.search}${anchor.hash}`
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (next !== current) history.pushState({}, '', next)
  void render()
})

window.addEventListener('popstate', () => {
  void render()
})

void render()
