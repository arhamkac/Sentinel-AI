import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

/** Shared shell for pages: consistent spacing and a centered max-width layout. */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-[1800px] space-y-6 px-6 py-8 sm:px-8 sm:py-8 xl:px-10 xl:py-10', className)}>
      {children}
    </div>
  )
}
