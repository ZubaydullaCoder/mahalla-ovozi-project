import { strings } from '../strings.ts'

export function OpsPage() {
  // Epic 6 will build the Developer Ops Console here.
  // Server-side guarded by NODE_ENV + OPS_ENABLED + OPS_SECRET.
  return <div style={{ padding: 24 }}>{strings.pages.opsPlaceholder}</div>
}
