// apps/web/src/components/lane-grid/lane-grid.tsx
// Layout-only component: receives pre-grouped signals, no data fetching.
import { CATEGORY_COLORS } from '../../theme.ts'
import { LaneColumn } from './lane-column.tsx'
import type { Signal } from '../../api/signals.ts'

export type LaneKey = 'hokim' | 'water' | 'electricity' | 'gas' | 'waste'

export type SignalsByCategory = Record<LaneKey, Signal[]>

const LANE_ORDER: LaneKey[] = ['hokim', 'water', 'electricity', 'gas', 'waste']

export interface LaneGridProps {
  signals: SignalsByCategory
  activeSignalId: number | null
  onCardClick: (signal: Signal) => void
}

export function LaneGrid({ signals, onCardClick }: LaneGridProps) {
  return (
    <div
      className="lane-grid"
      style={{
        display: 'flex',
        height: 'calc(100vh - 56px)',
        overflow: 'hidden',
      }}
    >
      {LANE_ORDER.map((laneKey) => (
        <LaneColumn
          key={laneKey}
          laneKey={laneKey}
          signals={signals[laneKey]}
          // categoryColor for cards is always the signal's service category — handled in LaneColumn
          // CATEGORY_COLORS[hokim] is NOT passed as card color (ANTI-PATTERN prevention)
          onCardClick={onCardClick}
        />
      ))}
    </div>
  )
}

// Re-export for consumers who import LaneKey from this module
export { CATEGORY_COLORS }
