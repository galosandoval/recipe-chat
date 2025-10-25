'use client'

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { Button } from './button'
import { Card } from './card'
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className='flex min-h-svh items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <div className='flex flex-col items-center gap-4 p-6 text-center'>
          <div className='bg-destructive/10 rounded-full p-3'>
            <AlertTriangleIcon className='text-destructive h-6 w-6' />
          </div>

          <div className='space-y-2'>
            <h2 className='text-lg font-semibold'>Something went wrong</h2>
            <p className='text-muted-foreground text-sm'>
              An unexpected error occurred. Please try again.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className='mt-4 text-left'>
                <summary className='text-muted-foreground cursor-pointer text-xs'>
                  Error details
                </summary>
                <pre className='text-muted-foreground mt-2 text-xs break-words whitespace-pre-wrap'>
                  {error.message}
                </pre>
              </details>
            )}
          </div>

          <Button onClick={resetErrorBoundary} className='w-full'>
            <RefreshCwIcon className='mr-2 h-4 w-4' />
            Try again
          </Button>
        </div>
      </Card>
    </div>
  )
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
