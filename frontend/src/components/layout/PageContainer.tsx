import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div
      className={cn('max-w-[1800px] mx-auto w-full', className)}
      style={{ padding: '32px clamp(16px, 4vw, 40px)' }}
    >
      {children}
    </div>
  )
}

