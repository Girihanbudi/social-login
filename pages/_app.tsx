import '../styles/globals.css'
import type { AppProps } from 'next/app'
import '@constants/translation'
import { ThemeProvider } from '@mui/material'
import { lightTheme } from '@styles/default'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={lightTheme}>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp