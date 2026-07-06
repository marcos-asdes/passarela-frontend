import type { ButtonProps as AntButtonProps } from 'antd'

/** Props do botão padrão da aplicação — estende o antd Button com a opção de ocupar 100% da largura. */
export interface ButtonProps extends AntButtonProps {
  fullWidth?: boolean
}
