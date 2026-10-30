import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import PokemonList from './pages/PokemonList.jsx'
import PokemonDetail from './pages/PokemonDetail.jsx'
import Teams from './pages/Teams.jsx'
import TeamDetail from './pages/TeamDetail.jsx'
import Favorites from './pages/Favorites.jsx'
import Settings from './pages/Settings.jsx'

function App() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pokemon" element={<PokemonList />} />
          <Route path="/pokemon/:name" element={<PokemonDetail />} />
          <Route path="/team" element={<Teams />} />
          <Route path="/team/:id" element={<TeamDetail />} />
          <Route path="/favorieten" element={<Favorites />} />
          <Route path="/instellingen" element={<Settings />} />
        </Routes>
      </main>
    </>
  )
}

export default App
