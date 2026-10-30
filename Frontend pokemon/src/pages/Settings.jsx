import { useState } from 'react'
import { clearAllData } from '../lib/storage.js'

function Settings() {
  const [done, setDone] = useState(false)

  return (
    <>
      <h1>Instellingen</h1>
      <p className="lede">Wis opgeslagen favorieten en teams van dit apparaat.</p>
      <button
        type="button"
        className="btn"
        onClick={() => {
          clearAllData()
          setDone(true)
        }}
      >
        Alles wissen
      </button>
      {done ? <p className="hint">Gegevens gewist.</p> : null}
    </>
  )
}

export default Settings
