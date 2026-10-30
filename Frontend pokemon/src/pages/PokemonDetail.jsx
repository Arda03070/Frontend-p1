import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { capitalize, formatTypes } from '../lib/i18n.js'
import {
  addPokemonToTeam,
  getTeams,
  isFavorite,
  TEAM_LIMIT,
  toggleFavorite,
} from '../lib/storage.js'

function spriteOf(pokemon) {
  return (
    pokemon.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.sprites?.front_default
  )
}

function PokemonDetail() {
  const { name } = useParams()
  const [pokemon, setPokemon] = useState(null)
  const [description, setDescription] = useState('')
  const [favorite, setFavorite] = useState(false)
  const [teamId, setTeamId] = useState('')
  const [hint, setHint] = useState('')
  const teams = getTeams()

  useEffect(() => {
    async function load() {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      const data = await res.json()
      setPokemon(data)
      setFavorite(isFavorite(data.id))
      setTeamId(getTeams()[0]?.id || '')

      const speciesRes = await fetch(data.species.url)
      const species = await speciesRes.json()
      const text =
        species.flavor_text_entries.find((entry) => entry.language.name === 'nl') ||
        species.flavor_text_entries.find((entry) => entry.language.name === 'en')
      setDescription(text?.flavor_text.replace(/[\f\n\r]/g, ' ') || '')
    }

    load()
  }, [name])

  if (!pokemon) return <p className="state">Gegevens laden...</p>

  const stat = (key) => pokemon.stats.find((item) => item.stat.name === key)?.base_stat ?? 0

  function onFavorite() {
    setFavorite(toggleFavorite(pokemon.id))
  }

  function onAddToTeam() {
    const result = addPokemonToTeam(teamId, pokemon.id)
    if (result.ok) setHint('Toegevoegd aan team.')
    else if (result.full) setHint(`Dit team is vol (max ${TEAM_LIMIT}).`)
    else if (result.duplicate) setHint('Deze Pokémon zit al in dit team.')
    else setHint('Maak eerst een team.')
  }

  return (
    <section className="detail">
      <div className="detail__art">
        <img src={spriteOf(pokemon)} alt={pokemon.name} />
      </div>
      <div className="detail__body">
        <div className="detail__heading">
          <h1>{capitalize(pokemon.name)}</h1>
          <p className="muted">{formatTypes(pokemon.types.map((t) => t.type.name))}</p>
          <span className="badge">#{String(pokemon.id).padStart(3, '0')}</span>
        </div>
        <h2>Basis informatie</h2>
        <dl className="stats">
          <div>
            <dt>HP</dt>
            <dd>{stat('hp')}</dd>
          </div>
          <div>
            <dt>Aanval</dt>
            <dd>{stat('attack')}</dd>
          </div>
          <div>
            <dt>Verdediging</dt>
            <dd>{stat('defense')}</dd>
          </div>
          <div>
            <dt>Snelheid</dt>
            <dd>{stat('speed')}</dd>
          </div>
        </dl>
        <h2>Beschrijving</h2>
        <p>{description || 'Geen beschrijving beschikbaar.'}</p>
        <div className="actions">
          <button type="button" className="btn" onClick={onFavorite}>
            {favorite ? '★ Verwijder uit favorieten' : '☆ Toevoegen aan favorieten'}
          </button>
        </div>
        <div className="team-add">
          {teams.length === 0 ? (
            <Link className="btn" to="/team">
              Maak eerst een team
            </Link>
          ) : (
            <>
              <select value={teamId} onChange={(event) => setTeamId(event.target.value)}>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <button type="button" className="btn" onClick={onAddToTeam}>
                Toevoegen aan team
              </button>
            </>
          )}
        </div>
        {hint ? <p className="hint">{hint}</p> : null}
        <Link className="back" to="/pokemon">
          ‹ Terug naar lijst
        </Link>
      </div>
    </section>
  )
}

export default PokemonDetail
