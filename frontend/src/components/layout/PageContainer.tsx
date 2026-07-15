import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div
      className={cn('px-4 py-6 md:px-6 lg:px-8 max-w-[1800px] mx-auto w-full', className)}
    >
      {children}
    </div>
  )
}

