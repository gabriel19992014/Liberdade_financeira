import type { Metadata } from 'next'
import '@/styles/globals.css'
import { ThemeProvider } from '@/context/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'Finance App',
  description: 'Aplicacao de controle financeiro'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  )
}
