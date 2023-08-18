import { useState } from 'react'
import Update from '@/components/update'
import logoVite from './assets/logo-vite.svg'
import logoElectron from './assets/logo-electron.svg'
import './App.scss'

console.log('[App.tsx]', `Hello world from Electron ${process.versions.electron}!`)

function App() {
  const [count, setCount] = useState(0)
  return (
    <div className='App'>
      <div className='logo-box'>
        <a href='https://github.com/electron-vite/electron-vite-react' target='_blank'>
          <img src={logoElectron} className='logo electron' alt='Electron + Vite logo' />
        </a>
      </div>
      <h1>Electron Desktop Application</h1>
      <div className='card'>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          test <code>v0.4.0</code>, now when i click update btn, it should tell me that this is the latest version
        </p>
      </div>
      <p className='read-the-docs'>
        Click on the Electron + Vite logo to learn more
      </p>
      <div className='flex-center'>
        Place static files into the<code>/public</code> folder <img style={{ width: '5em' }} src='./node.svg' alt='Node logo' />
      </div>

      <Update />
    </div>
  )
}

export default App
