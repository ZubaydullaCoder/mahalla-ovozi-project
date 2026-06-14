// apps/web/src/pages/dashboard-page.tsx
import { Alert, Skeleton } from 'antd'
import { AppShell } from '../components/app-shell.tsx'
import { UnsupportedScreen } from '../components/unsupported-screen.tsx'
import { LaneGrid, type SignalsByCategory } from '../components/lane-grid/lane-grid.tsx'
import { useSignals, type Signal } from '../api/signals.ts'
import { strings } from '../strings.ts'

// Lane label order for loading skeleton — matches LANE_ORDER in LaneGrid
const SKELETON_LANE_LABELS = [
  strings.dashboard.lanes.hokim,
  strings.dashboard.lanes.water,
  strings.dashboard.lanes.electricity,
  strings.dashboard.lanes.gas,
  strings.dashboard.lanes.waste,
] as const

// Group raw Signal[] into 5 lanes.
// Hokim lane duplication: signals with hokimRelated===true appear in BOTH
// their service lane AND the hokim lane (same object reference — not a copy).
function groupSignals(signals: Signal[]): SignalsByCategory {
  const lanes: SignalsByCategory = {
    hokim:       [],
    water:       [],
    electricity: [],
    gas:         [],
    waste:       [],
  }

  for (const signal of signals) {
    // Always add to service lane
    lanes[signal.category].push(signal)
    // Also add to hokim lane if hokimRelated — same reference
    if (signal.hokimRelated) {
      lanes.hokim.push(signal)
    }
  }

  return lanes
}

export function DashboardPage() {
  const { data: signals, isLoading, isError } = useSignals()
  const groupedSignals = groupSignals(signals ?? [])

  // Context drawer wiring is Story 4-3 — stub with console.log for now
  const handleCardClick = (signal: Signal) => {
    console.log('Signal clicked:', signal.id)
  }

  return (
    <>
      <AppShell>
        {isLoading ? (
          /* Loading state: skeleton in each of 5 lanes, aria-busy per AC-1 */
          <div style={{ display: 'flex', height: 'calc(100vh - 56px)', gap: 1 }}>
            {SKELETON_LANE_LABELS.map((label) => (
              <div
                key={label}
                role="feed"
                aria-label={label}
                aria-busy="true"
                style={{ flex: 1, padding: '16px 8px' }}
              >
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error state: calm warning — do NOT render empty lanes as valid empty data */
          <div style={{ padding: 16 }}>
            <Alert
              type="warning"
              showIcon
              message={strings.dashboard.loadErrorTitle}
              description={strings.dashboard.loadErrorDescription}
            />
          </div>
        ) : (
          /* Data state: 5-lane grid */
          <LaneGrid
            signals={groupedSignals}
            activeSignalId={null}
            onCardClick={handleCardClick}
          />
        )}
      </AppShell>
      <UnsupportedScreen />
    </>
  )
}
