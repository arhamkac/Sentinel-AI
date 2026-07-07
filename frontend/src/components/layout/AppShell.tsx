import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useEventStream } from '@/hooks/useWebSocket'

interface AppShellProps {
  title?: string
  description?: string
}

export function AppShell({ title, description }: AppShellProps) {
  // Connect to live event stream when app shell mounts
  useEventStream()

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: '#020814' }}>
      {/* Animated global background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 229, 255, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 255, 0.025) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      {/* Ambient glow spots */}
      <div className="absolute top-0 left-1/4 w-96 h-64 bg-[#00E5FF]/[0.025] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-64 bg-[#7C3AED]/[0.02] rounded-full blur-3xl pointer-events-none" />

      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative z-10">
        <Topbar title={title} description={description} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
