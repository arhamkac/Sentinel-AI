import { Search } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/**
 * Reusable search input with icon. Used across Incidents, ThreatIntel, and MITRE pages.
 * Replaces 3 inline implementations of the same search input pattern.
 */
export function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }: SearchInputProps) {
  return (
    <div className={`relative flex-1 min-w-[200px] ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-10 pr-4 rounded-lg border border-[var(--border)] bg-[var(--bg-inset)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] outline-none transition-colors focus:border-[var(--primary-dim)] hover:border-[var(--border-strong)]"
      />
    </div>
  )
}
