import { extendTheme } from '@chakra-ui/react'

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const theme = extendTheme({ 
  config,
  fonts: {
    heading: `'Inter Bold', sans-serif`,
    body: `'Inter Regular', sans-serif`,
  }
 })

export default theme