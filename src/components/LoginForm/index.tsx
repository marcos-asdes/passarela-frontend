import type { ReactNode } from 'react'
import { Alert, Form } from 'antd'

import { Button } from '@/components/Button'
import { PasswordInput, TextInput } from '@/components/Input'
import type { LoginFormProps } from '@/components/LoginForm/types'
import { useLoginForm } from '@/components/LoginForm/useLoginForm'

/**
 * Formulário de login compartilhado por lojista e cliente. Só renderiza — estado e submissão
 * moram em `useLoginForm`.
 */
export function LoginForm({ role }: Readonly<LoginFormProps>): ReactNode {
  const { loading, error, loggedIn, handleSubmit } = useLoginForm(role)

  if (loggedIn) {
    return (
      <Alert type="success" showIcon title="Login realizado com sucesso" description="Seu painel está a caminho." />
    )
  }

  return (
    <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
      {error && (
        <Form.Item>
          <Alert type="error" showIcon title={error} />
        </Form.Item>
      )}
      <Form.Item
        name="email"
        label="E-mail"
        rules={[
          { required: true, message: 'E-mail é obrigatório' },
          { type: 'email', message: 'Informe um e-mail válido' }
        ]}
      >
        <TextInput placeholder="voce@exemplo.com" autoComplete="email" />
      </Form.Item>
      <Form.Item name="password" label="Senha" rules={[{ required: true, message: 'Senha é obrigatória' }]}>
        <PasswordInput placeholder="Sua senha" autoComplete="current-password" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" fullWidth loading={loading}>
          Entrar
        </Button>
      </Form.Item>
    </Form>
  )
}
