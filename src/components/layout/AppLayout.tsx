import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { useInboundStream } from '../../hooks/useInboundStream'

export default function AppLayout() {
  useInboundStream()

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
