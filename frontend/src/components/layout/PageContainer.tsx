import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

/** Shared shell for pages: consistent spacing and a centered max-width layout. */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-[1800px] px-8 py-6 sm:px-8 sm:py-6 lg:px-8 xl:px-8 2xl:px-8 space-y-8', className)}>
      {children}
    </div>
  )
}
