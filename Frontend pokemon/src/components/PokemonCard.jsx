import { Link } from 'react-router-dom'
import { capitalize } from '../lib/i18n.js'

function PokemonCard({ name, image, types }) {
  return (
    <article className="poke-card">
      <div className="poke-card__art">
        <img src={image} alt={name} />
      </div>
      <h3>{capitalize(name)}</h3>
      <p>{types}</p>
      <Link className="btn" to={`/pokemon/${name}`}>
        Bekijk
      </Link>
    </article>
  )
}

export default PokemonCard
