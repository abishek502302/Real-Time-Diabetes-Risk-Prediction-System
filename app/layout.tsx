import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Navbar } from '@/components/navbar'
import './globals.css'

export const metadata: Metadata = {
  title: 'DiabetesPredict - AI-Powered Diabetes Risk Assessment',
  description: 'Advanced machine learning-powered diabetes risk prediction tool. Assess your risk, simulate future scenarios, and get personalized health insights.',
  keywords: ['diabetes', 'prediction', 'machine learning', 'health', 'risk assessment', 'AI'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t py-6 text-center text-sm text-muted-foreground">
          <div className="container mx-auto px-4">
            <p>DiabetesPredict - AI-Powered Health Assessment Tool</p>
          </div>
        </footer>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
