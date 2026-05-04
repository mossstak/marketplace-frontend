import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Header from '@/components/Header'
import ThemeProvider from '@/components/theme/theme-provider'
import { CartProvider } from '@/context/CartContext'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Coffee Marketplace',
  description: 'Created By Mostak Khan',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <CartProvider>
            <main className="h-screen w-full overflow-hideen bg-[#eae8e0]">
              <Header />
              {children}
            </main>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
