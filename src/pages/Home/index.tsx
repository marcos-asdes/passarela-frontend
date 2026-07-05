import { useEffect } from 'react'
import { Typography } from 'antd'

import { Counter } from '@/components/Counter'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useHome } from '@/pages/Home/useHome'
import { fetchHealth } from '@/store/reducers/health/thunk'

/** Página inicial: dispara a checagem de status da API ao montar e exibe o exemplo de contador. */
function Home() {
  const dispatch = useAppDispatch()
  const { health, error } = useHome()

  useEffect(() => {
    dispatch(fetchHealth())
  }, [dispatch])

  return (
    <>
      <Typography.Title level={2}>Passarela</Typography.Title>
      <Typography.Paragraph type={error ? 'danger' : 'secondary'}>
        {error ?? health?.message ?? 'Conectando à API...'}
      </Typography.Paragraph>
      <Counter />
    </>
  )
}

export default Home
