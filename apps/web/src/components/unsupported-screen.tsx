import { Typography } from 'antd'
import { strings } from '../strings.ts'

const { Text } = Typography

export function UnsupportedScreen() {
  return (
    <div className="unsupported-screen">
      <Text style={{ fontSize: 18 }}>{strings.app.unsupportedScreen}</Text>
    </div>
  )
}
