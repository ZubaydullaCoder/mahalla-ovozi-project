import type { ReactNode } from 'react'
import { theme } from 'antd'
import { strings } from '../strings.ts'

interface AppShellProps {
  filterBar?: ReactNode // Slot for FilterBar (Story 4-1)
  children: ReactNode // Slot for LaneGrid (Story 3-3)
}

export function AppShell({ filterBar, children }: AppShellProps) {
  const { token } = theme.useToken()

  return (
    <div className="app-shell">
      {/* Filter bar zone — 56px sticky header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: 56,
          zIndex: 10,
          background: token.colorBgElevated,
          borderBottom: `1px solid ${token.colorBorder}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
        }}
      >
        {filterBar ?? (
          <span style={{ color: token.colorText, fontWeight: 500 }}>
            {strings.app.title}
          </span>
        )}
      </div>

      {/* Lane grid zone — fills remaining viewport height */}
      <div
        style={{
          height: 'calc(100vh - 56px)',
          overflow: 'hidden',
          background: token.colorBgLayout,
        }}
      >
        {children}
      </div>
    </div>
  )
}
