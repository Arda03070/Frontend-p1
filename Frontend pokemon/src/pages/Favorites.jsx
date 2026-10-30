import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PokemonCard from '../components/PokemonCard.jsx'
import { formatTypes } from '../lib/i18n.js'
import {
  deleteTeam,
  getFavoriteTeams,
  getFavorites,
  getTeams,
  isTeamFavorite,
  TEAM_LIMIT,
  toggleTeamFavorite,
} from '../lib/storage.js'

function spriteOf(pokemon) {
  return (
    pokemon.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.sprites?.front_default
  )
}

function Favorites() {
  const [pokemons, setPokemons] = useState([])
  const [teams, setTeams] = useState(getTeams().filter((team) => getFavoriteTeams().includes(team.id)))

  useEffect(() => {
    async function load() {
      const ids = getFavorites()
      const data = await Promise.all(
        ids.map((id) => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json())),
      )
      setPokemons(data)
    }
    load()
  }, [])

  function refreshTeams() {
    setTeams(getTeams().filter((team) => getFavoriteTeams().includes(team.id)))
  }

  return (
    <>
      <h1>Favorieten</h1>
      <h2>Pokémon</h2>
      {pokemons.length === 0 ? (
        <p className="state">Nog geen favoriete Pokémon.</p>
      ) : (
        <section className="grid">
          {pokemons.map((pokemon) => (
            <PokemonCard
              key={pokemon.id}
              name={pokemon.name}
              image={spriteOf(pokemon)}
              types={formatTypes(pokemon.types.map((t) => t.type.name))}
            />
          ))}
        </section>
      )}
      <h2>Teams</h2>
      {teams.length === 0 ? (
        <p className="state">Nog geen favoriete teams.</p>
      ) : (
        <section className="team-list">
          {teams.map((team) => (
            <article className="team-card" key={team.id}>
              <div>
                <h3>{team.name}</h3>
                <p>
                  {team.pokemonIds.length} / {TEAM_LIMIT} Pokémon
                </p>
              </div>
              <div className="actions">
                <Link className="btn" to={`/team/${team.id}`}>
                  Bekijk
                </Link>
                <button type="button" className="btn btn--ghost" onClick={() => { toggleTeamFavorite(team.id); refreshTeams() }}>
                  {isTeamFavorite(team.id) ? '★ Favoriet' : '☆ Favoriet'}
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => { deleteTeam(team.id); refreshTeams() }}>
                  Verwijder
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  )
}

export default Favorites
