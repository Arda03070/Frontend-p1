import { useEffect, useState } from 'react'
import PokemonCard from '../components/PokemonCard.jsx'
import { formatTypes, TYPE_LABELS } from '../lib/i18n.js'

function spriteOf(pokemon) {
  return (
    pokemon.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.sprites?.front_default
  )
}

function PokemonList() {
  const [pokemons, setPokemons] = useState([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [type, setType] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const cached = sessionStorage.getItem('ptm-gen1-cache')
    if (cached) {
      setPokemons(JSON.parse(cached))
      return
    }

    async function load() {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
        const data = await res.json()
        const details = await Promise.all(
          data.results.map((pokemon) => fetch(pokemon.url).then((r) => r.json())),
        )
        try {
          sessionStorage.setItem('ptm-gen1-cache', JSON.stringify(details))
        } catch {
          // cache te groot? dan gewoon in state houden
        }
        setPokemons(details)
      } catch {
        setError('De Pokédex kon niet geladen worden.')
      }
    }

    load()
  }, [])

  const types = [...new Set(pokemons.flatMap((p) => p.types.map((t) => t.type.name)))].sort()
  const favorites = JSON.parse(localStorage.getItem('ptm-favorites') || '[]')

  const visible = pokemons.filter((pokemon) => {
    const matchesQuery = pokemon.name.includes(query.toLowerCase().trim())
    const matchesFav = filter !== 'favorites' || favorites.includes(pokemon.id)
    const matchesType = !type || pokemon.types.some((t) => t.type.name === type)
    return matchesQuery && matchesFav && matchesType
  })

  if (error) return <p className="state">{error}</p>
  if (pokemons.length === 0) return <p className="state">Pokémon laden...</p>

  return (
    <>
      <h1>Pokémon Lijst</h1>
      <div className="toolbar">
        <label className="search">
          <span className="sr-only">Zoek een Pokémon</span>
          <input
            type="search"
            placeholder="Zoek een Pokémon..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="filters">
          <button type="button" className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>
            Alle
          </button>
          <button
            type="button"
            className={filter === 'favorites' ? 'is-active' : ''}
            onClick={() => setFilter('favorites')}
          >
            Favorieten
          </button>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="">Type</option>
            {types.map((value) => (
              <option key={value} value={value}>
                {TYPE_LABELS[value] || value}
              </option>
            ))}
          </select>
        </div>
      </div>
      {visible.length === 0 ? (
        <p className="state">Geen Pokémon gevonden.</p>
      ) : (
        <section className="grid">
          {visible.map((pokemon) => (
            <PokemonCard
              key={pokemon.id}
              name={pokemon.name}
              image={spriteOf(pokemon)}
              types={formatTypes(pokemon.types.map((t) => t.type.name))}
            />
          ))}
        </section>
      )}
    </>
  )
}

export default PokemonList
