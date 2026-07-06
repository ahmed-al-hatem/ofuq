import type { Metadata } from "next"
import type { ReactNode } from "react"

import { DirectionProvider } from "@/components/ui/direction"
import { appConfig } from "@/config/app"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Ofuq | أُفُق",
    template: "%s | Ofuq",
  },
  description: appConfig.description,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <DirectionProvider direction="rtl">{children}</DirectionProvider>
      </body>
    </html>
  )
}
