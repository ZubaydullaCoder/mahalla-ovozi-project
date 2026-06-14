import { AppShell } from '../components/app-shell.tsx'
import { UnsupportedScreen } from '../components/unsupported-screen.tsx'
import { strings } from '../strings.ts'

export function DashboardPage() {
  return (
    <>
      <AppShell>
        {/* LaneGrid will go here in Story 3-3 */}
        <div>{strings.pages.dashboardPlaceholder}</div>
      </AppShell>
      <UnsupportedScreen />
    </>
  )
}
