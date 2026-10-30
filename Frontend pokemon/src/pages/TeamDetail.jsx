import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PokemonCard from '../components/PokemonCard.jsx'
import { formatTypes } from '../lib/i18n.js'
import {
  deleteTeam,
  getTeamById,
  isTeamFavorite,
  removePokemonFromTeam,
  TEAM_LIMIT,
  toggleTeamFavorite,
} from '../lib/storage.js'

function spriteOf(pokemon) {
  return (
    pokemon.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.sprites?.front_default
  )
}

function TeamDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const team = getTeamById(id)
  const [members, setMembers] = useState([])
  const [favorite, setFavorite] = useState(team ? isTeamFavorite(team.id) : false)

  useEffect(() => {
    if (!team) return
    async function load() {
      const data = await Promise.all(
        team.pokemonIds.map((pokemonId) =>
          fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`).then((res) => res.json()),
        ),
      )
      setMembers(data)
    }
    load()
  }, [id])

  if (!team) {
    return (
      <>
        <p className="state">Dit team bestaat niet.</p>
        <Link className="back" to="/team">
          ‹ Terug naar teams
        </Link>
      </>
    )
  }

  const slots = Array.from({ length: TEAM_LIMIT }, (_, index) => members[index] || null)

  return (
    <>
      <h1>{team.name}</h1>
      <p className="lede">Maximaal {TEAM_LIMIT} Pokémon in dit team.</p>
      <div className="actions">
        <button
          type="button"
          className="btn"
          onClick={() => setFavorite(toggleTeamFavorite(team.id))}
        >
          {favorite ? '★ Verwijder uit favorieten' : '☆ Team favoriet maken'}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            deleteTeam(team.id)
            navigate('/team')
          }}
        >
          Team verwijderen
        </button>
      </div>
      <section className="grid">
        {slots.map((pokemon, index) =>
          pokemon ? (
            <div key={pokemon.id}>
              <PokemonCard
                name={pokemon.name}
                image={spriteOf(pokemon)}
                types={formatTypes(pokemon.types.map((t) => t.type.name))}
              />
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  removePokemonFromTeam(team.id, pokemon.id)
                  setMembers((current) => current.filter((item) => item.id !== pokemon.id))
                }}
              >
                Verwijder
              </button>
            </div>
          ) : (
            <article className="slot" key={`empty-${index}`}>
              Lege plek
            </article>
          ),
        )}
      </section>
      {members.length === 0 ? (
        <p className="state">Dit team is nog leeg. Voeg Pokémon toe via een detailpagina.</p>
      ) : null}
      <Link className="back" to="/team">
        ‹ Terug naar teams
      </Link>
    </>
  )
}

export default TeamDetail
