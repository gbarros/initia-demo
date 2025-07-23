'use client'

import { ReactNode, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { injectStyles, InitiaWidgetProvider } from "@initia/widget-react"
import initiaWidgetStyles from "@initia/widget-react/styles.js"

// Client-side only component that wraps the Initia Widget
function InitiaWidgetWrapperComponent({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Inject the widget styles only on the client side
    injectStyles(initiaWidgetStyles)
  }, [])

  return <InitiaWidgetProvider>{children}</InitiaWidgetProvider>
}

// Create a client-side only version with dynamic import and ssr: false
export const InitiaWidgetWrapper = dynamic(
  () => Promise.resolve(InitiaWidgetWrapperComponent),
  { ssr: false }
)
