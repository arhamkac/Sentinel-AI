import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circle' | 'text'
  lines?: number
}

function Skeleton({ className, variant = 'default', lines = 1, ...props }: SkeletonProps) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'animate-pulse rounded-md bg-[#1E293B]',
              i === lines - 1 ? 'w-3/4' : 'w-full',
              'h-4',
              className
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-[#1E293B]',
        variant === 'circle' ? 'rounded-full' : 'rounded-md',
        className
      )}
      {...props}
    />
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton variant="text" lines={2} />
    </div>
  )
}

export { Skeleton, SkeletonCard }
