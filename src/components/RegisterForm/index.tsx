import type { ReactNode } from 'react'
import { Alert, DatePicker, Form } from 'antd'
import dayjs from 'dayjs'

import { Button } from '@/components/Button'
import { PasswordInput, TextInput } from '@/components/Input'
import type { RegisterFormProps } from '@/components/RegisterForm/types'
import { useRegisterForm } from '@/components/RegisterForm/useRegisterForm'
import { isValidCPF } from '@/utils/cpf'
import { formatCPF, formatPhone, onlyDigits } from '@/utils/formatters'

/** Mesma composição exigida pelo backend (auth/interface/register.dto.ts). */
const PASSWORD_COMPOSITION_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/

/**
 * Formulário de cadastro compartilhado por lojista e cliente — só `role` muda entre as páginas.
 * Só renderiza — estado e submissão moram em `useRegisterForm`.
 */
export function RegisterForm(props: Readonly<RegisterFormProps>): ReactNode {
  const { loading, error, handleSubmit } = useRegisterForm(props)

  return (
    <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
      {error && (
        <Form.Item>
          <Alert type="error" showIcon title={error} />
        </Form.Item>
      )}
      <Form.Item
        name="name"
        label="Nome completo"
        rules={[
          { required: true, message: 'Nome completo é obrigatório' },
          { min: 2, max: 120, message: 'Deve ter entre 2 e 120 caracteres' }
        ]}
      >
        <TextInput placeholder="Maria da Silva" autoComplete="name" />
      </Form.Item>
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
      <Form.Item
        name="cpf"
        label="CPF"
        getValueFromEvent={(event) => formatCPF(event.target.value)}
        rules={[
          { required: true, message: 'CPF é obrigatório' },
          {
            validator: (_, value: string | undefined) =>
              value && isValidCPF(value) ? Promise.resolve() : Promise.reject(new Error('Informe um CPF válido'))
          }
        ]}
      >
        <TextInput placeholder="000.000.000-00" inputMode="numeric" />
      </Form.Item>
      <Form.Item
        name="phone"
        label="Telefone"
        getValueFromEvent={(event) => formatPhone(event.target.value)}
        rules={[
          { required: true, message: 'Telefone é obrigatório' },
          {
            validator: (_, value: string | undefined) => {
              const length = onlyDigits(value ?? '').length
              return length >= 10 && length <= 11
                ? Promise.resolve()
                : Promise.reject(new Error('Informe um telefone válido'))
            }
          }
        ]}
      >
        <TextInput placeholder="(11) 91234-5678" inputMode="numeric" />
      </Form.Item>
      <Form.Item
        name="birthDate"
        label="Data de nascimento"
        rules={[{ required: true, message: 'Data de nascimento é obrigatória' }]}
      >
        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabledDate={(date) => date.isAfter(dayjs())} />
      </Form.Item>
      <Form.Item
        name="password"
        label="Senha"
        extra="Mínimo de 10 caracteres, com maiúscula, minúscula, número e caractere especial."
        rules={[
          { required: true, message: 'Senha é obrigatória' },
          { min: 10, max: 128, message: 'Deve ter entre 10 e 128 caracteres' },
          {
            pattern: PASSWORD_COMPOSITION_REGEX,
            message: 'Deve conter maiúscula, minúscula, número e caractere especial'
          }
        ]}
      >
        <PasswordInput placeholder="Crie uma senha" autoComplete="new-password" />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        label="Confirmar senha"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Confirme sua senha' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              return value === getFieldValue('password')
                ? Promise.resolve()
                : Promise.reject(new Error('As senhas devem ser iguais'))
            }
          })
        ]}
      >
        <PasswordInput placeholder="Repita sua senha" autoComplete="new-password" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" fullWidth loading={loading}>
          Criar conta
        </Button>
      </Form.Item>
    </Form>
  )
}
