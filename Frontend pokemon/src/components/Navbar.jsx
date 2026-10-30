import { Link, NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <header className="topbar">
      <Link className="brand" to="/">
        Pokemon Team Manager
      </Link>
      <nav>
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'is-active' : '')}>
          Home
        </NavLink>
        <NavLink to="/pokemon" className={({ isActive }) => (isActive ? 'is-active' : '')}>
          Pokémon
        </NavLink>
        <NavLink to="/favorieten" className={({ isActive }) => (isActive ? 'is-active' : '')}>
          Favorieten
        </NavLink>
        <NavLink to="/team" className={({ isActive }) => (isActive ? 'is-active' : '')}>
          Team
        </NavLink>
      </nav>
    </header>
  )
}

export default Navbar
