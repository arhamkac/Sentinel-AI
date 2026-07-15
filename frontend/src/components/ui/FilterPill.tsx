interface FilterPillProps {
  label: string
  active: boolean
  onClick: () => void
}

/**
 * Reusable filter pill button with active/inactive states.
 * Used across Incidents, ThreatIntel, and MITRE pages.
 */
export function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
        active
          ? 'bg-[var(--primary-bg)] text-[var(--primary)] border-[var(--primary-ring)]'
          : 'bg-[var(--bg-inset)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
      }`}
    >
      {label}
    </button>
  )
}

interface FilterPillGroupProps {
  options: { label: string; value: string }[]
  selected: string
  onChange: (value: string) => void
  /** Whether to include an "All" option that clears the filter */
  showAll?: boolean
}

/**
 * A group of filter pills with mutual exclusion.
 * Provides consistent filter UI across all pages.
 */
export function FilterPillGroup({ options, selected, onChange, showAll = true }: FilterPillGroupProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {showAll && (
        <FilterPill
          label="All"
          active={!selected}
          onClick={() => onChange('')}
        />
      )}
      {options.map(opt => (
        <FilterPill
          key={opt.value}
          label={opt.label}
          active={selected === opt.value}
          onClick={() => onChange(selected === opt.value ? '' : opt.value)}
        />
      ))}
    </div>
  )
}
