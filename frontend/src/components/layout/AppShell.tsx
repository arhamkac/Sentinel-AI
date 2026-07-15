import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useEventStream } from '@/hooks/useWebSocket'
import { GlobalCopilot } from '../ai/GlobalCopilot'

export function AppShell() {
  useEventStream()

  return (
    <div 
      className="flex h-screen w-full overflow-hidden" 
      style={{ 
        background: 'radial-gradient(circle at 50% 0%, #1a2540 0%, #060B16 60%)',
      }}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10">
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
          <Outlet />
        </main>
      </div>
      <GlobalCopilot />
    </div>
  )
}
