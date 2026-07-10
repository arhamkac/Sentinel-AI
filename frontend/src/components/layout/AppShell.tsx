import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useEventStream } from '@/hooks/useWebSocket'

export function AppShell() {
  useEventStream()

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: 'var(--bg-app)' }}>

      {/* ── Background: subtle dot grid only, no competing blobs ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,217,180,0.07) 1px, transparent 1px)',
          backgroundSize : '28px 28px',
          animation      : 'grid-drift 40s linear infinite',
        }}
      />

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main panel: flush to sidebar, own border, no extra margin ── */}
      <div
        className="relative z-10 flex flex-col flex-1 min-w-0 overflow-hidden"
        style={{
          background  : 'var(--bg-panel)',
          borderLeft  : '1px solid var(--bd-default)',
        }}
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
