interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div
      className={className}
      style={{
        maxWidth: 1800,
        margin: '0 auto',
        padding: '24px 32px',
        width: '100%',
      }}
    >
      {children}
    </div>
  )
}
