import { Link } from 'react-router-dom'

function Home() {
  return (
    <>
      <section className="hero-panel">
        <div className="hero-art" aria-hidden="true">
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" alt="" />
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png" alt="" />
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png" alt="" />
        </div>
        <h1>Welkom bij Pokemon Team Manager!</h1>
        <p>Beheer je teams, bekijk Pokémon en voeg je favorieten toe.</p>
      </section>
      <section className="quick-grid">
        <Link className="quick-card" to="/team">
          <span className="quick-icon">👤</span>
          <span>Mijn Teams</span>
          <span className="chevron">›</span>
        </Link>
        <Link className="quick-card" to="/pokemon">
          <span className="quick-icon">
            <span className="pokeball" aria-hidden="true"></span>
          </span>
          <span>Bekijk Pokémon</span>
          <span className="chevron">›</span>
        </Link>
        <Link className="quick-card" to="/favorieten">
          <span className="quick-icon">★</span>
          <span>Favorieten</span>
          <span className="chevron">›</span>
        </Link>
        <Link className="quick-card" to="/instellingen">
          <span className="quick-icon">⚙</span>
          <span>Instellingen</span>
          <span className="chevron">›</span>
        </Link>
      </section>
    </>
  )
}

export default Home
