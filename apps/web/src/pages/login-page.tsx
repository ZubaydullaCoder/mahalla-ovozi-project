import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Typography } from 'antd'
import { login, AuthError } from '../api/auth.ts'
import { strings } from '../strings.ts'

const { Title, Text } = Typography

interface LoginFormValues {
  username: string
  password: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [form] = Form.useForm<LoginFormValues>()

  async function handleSubmit(values: LoginFormValues) {
    setErrorMessage(null)
    setIsLoading(true)
    try {
      await login(values)
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.status === 429) {
          setErrorMessage(strings.login.errorRateLimit)
        } else if (err.status === 401) {
          // Do NOT expose which field was wrong.
          setErrorMessage(strings.login.errorInvalidCredentials)
        } else {
          setErrorMessage(strings.login.errorUnknown)
        }
      } else {
        setErrorMessage(strings.login.errorUnknown)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Title level={3} style={styles.title}>
          {strings.login.title}
        </Title>
        <Text type="secondary" style={styles.subtitle}>
          {strings.login.subtitle}
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={styles.form}
          autoComplete="off"
        >
          {errorMessage && (
            <div style={styles.errorBanner} role="alert" aria-live="polite">
              <Text style={styles.errorText}>{errorMessage}</Text>
            </div>
          )}

          <Form.Item
            label={strings.login.usernameLabel}
            name="username"
            rules={[{ required: true, message: strings.login.usernameRequired }]}
          >
            <Input
              placeholder={strings.login.usernamePlaceholder}
              size="large"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label={strings.login.passwordLabel}
            name="password"
            rules={[{ required: true, message: strings.login.passwordRequired }]}
          >
            <Input.Password
              placeholder={strings.login.passwordPlaceholder}
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={isLoading}
            >
              {strings.login.submitButton}
            </Button>
          </Form.Item>
        </Form>
        {/* No registration link. No password-reset link. Intentional per story AC. */}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F4F2',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: '40px 36px',
    width: 'min(380px, calc(100vw - 32px))',
    boxSizing: 'border-box',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  },
  title: {
    margin: 0,
    marginBottom: 4,
    color: '#1A1714',
    textAlign: 'center' as const,
  },
  subtitle: {
    display: 'block',
    textAlign: 'center' as const,
    marginBottom: 28,
    color: '#6B6560',
  },
  form: {
    marginTop: 0,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 6,
    padding: '10px 14px',
    marginBottom: 16,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
  },
} as const
