import type { ThemeConfig } from 'antd'

export const mahallaTheme: ThemeConfig = {
  token: {
    colorPrimary: '#4F46A8',
    colorBgContainer: '#FAFAF9',
    colorBgLayout: '#F5F4F2',
    colorBgElevated: '#FFFFFF',
    colorBorder: '#E8E5E1',
    colorBorderSecondary: '#D1CEC9',
    colorText: '#1A1714',
    colorTextSecondary: '#6B6560',
    colorTextPlaceholder: '#A09990',
    colorWarning: '#D97706',
    colorSuccess: '#16A34A',
    // colorError (#DC2626) is reserved — not used in any MVP hokim-facing element.
    // It is safe to set it; do NOT use it in UI components.
    colorError: '#DC2626',
    fontFamily: "'Inter', 'Outfit', sans-serif",
    borderRadius: 8,
  },
}
