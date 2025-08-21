'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TestPage() {
  const [clickCount, setClickCount] = useState(0)

  const handleClick = () => {
    console.log('Button clicked!')
    setClickCount(prev => prev + 1)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Test Page</h1>
        
        <div className="space-y-4">
          <Button onClick={handleClick} className="w-full">
            Test Button (Clicked: {clickCount})
          </Button>
          
          <Link href="/signin">
            <Button variant="outline" className="w-full">
              Go to Sign In
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="secondary" className="w-full">
              Go Home
            </Button>
          </Link>
        </div>
        
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">
            This page is for testing button functionality on Vercel deployment.
            Check the browser console for click events.
          </p>
        </div>
      </div>
    </div>
  )
}
