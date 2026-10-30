import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createTeam, deleteTeam, getTeams, isTeamFavorite, toggleTeamFavorite, TEAM_LIMIT } from '../lib/storage.js'

function Teams() {
  const [name, setName] = useState('')
  const [teams, setTeams] = useState(getTeams())

  function refresh() {
    setTeams(getTeams())
  }

  function onCreate(event) {
    event.preventDefault()
    createTeam(name)
    setName('')
    refresh()
  }

  return (
    <>
      <h1>Mijn Teams</h1>
      <form className="create-bar" onSubmit={onCreate}>
        <label>
          <span className="sr-only">Teamnaam</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nieuwe teamnaam..."
            required
          />
        </label>
        <button className="btn" type="submit">
          Team aanmaken
        </button>
      </form>
      {teams.length === 0 ? (
        <p className="state">Je hebt nog geen teams. Maak hierboven je eerste team.</p>
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
                <button type="button" className="btn btn--ghost" onClick={() => { toggleTeamFavorite(team.id); refresh() }}>
                  {isTeamFavorite(team.id) ? '★ Favoriet' : '☆ Favoriet'}
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => { deleteTeam(team.id); refresh() }}>
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

export default Teams
