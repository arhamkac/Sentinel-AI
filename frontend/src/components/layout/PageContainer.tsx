import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  action?: React.ReactNode
}

export function PageContainer({ children, className, title, description, action }: PageContainerProps) {
  return (
    <div className={cn('p-6 flex flex-col gap-6', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && (
              <h1 className="text-xl font-bold text-[#E2E8F0] tracking-tight">{title}</h1>
            )}
            {description && (
              <p className="text-sm text-[#8FA3BF] mt-0.5">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
