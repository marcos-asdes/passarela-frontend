import { Button, Space, Typography } from 'antd'
import styled from 'styled-components'

import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { decremented, incremented } from '@/store/reducers/counter'

const Value = styled(Typography.Text)`
  font-size: 24px;
  font-variant-numeric: tabular-nums;
  min-width: 2ch;
  text-align: center;
`

/** Contador de exemplo, lê e altera `store.counter` via Redux Toolkit. */
export function Counter() {
  const value = useAppSelector((state) => state.counter.value)
  const dispatch = useAppDispatch()

  return (
    <Space align="center">
      <Button onClick={() => dispatch(decremented())}>-</Button>
      <Value strong>{value}</Value>
      <Button onClick={() => dispatch(incremented())}>+</Button>
    </Space>
  )
}
