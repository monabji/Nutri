type Props = { label: string; value?: string | number; detail?: string }

export function MetricCard({ label, value, detail }: Props) {
  return (
    <article className="metric-card">
      <p>{label}</p>
      <strong>{value ?? 'Not reported'}</strong>
      <span>{value === undefined ? 'Not reported by Open Food Facts' : detail || 'Reported by Open Food Facts'}</span>
    </article>
  )
}
