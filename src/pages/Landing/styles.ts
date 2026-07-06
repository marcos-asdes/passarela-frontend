import styled from 'styled-components'

export const Page = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`

export const Hero = styled.div`
  text-align: center;
  padding: 80px 24px 48px;
`

export const Logo = styled.img`
  width: 320px;
  height: auto;
  margin-bottom: 8px;
`

export const Content = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px 80px;
`
