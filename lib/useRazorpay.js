// lib/useRazorpay.js
'use client'

import { useEffect, useState } from 'react'

export const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check if we're on client side
    if (typeof window === 'undefined') return

    // Check if Razorpay script is already loaded
    if (window.Razorpay) {
      setIsLoaded(true)
      return
    }

    // Check if script is already in document
    const existingScript = document.querySelector('script[src*="razorpay"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true))
      return
    }

    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    
    script.onload = () => {
      setIsLoaded(true)
    }

    script.onerror = () => {
      console.error('Failed to load Razorpay SDK')
      setIsLoaded(false)
    }

    document.body.appendChild(script)

    // Cleanup
    return () => {
      if (script.parentNode) {
        document.body.removeChild(script)
      }
    }
  }, [])

  return isLoaded
}
