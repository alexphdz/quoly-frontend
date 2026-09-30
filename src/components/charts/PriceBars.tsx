export default function PriceBars({
  rows,
  highlightId,
  tone = 'price',
  formatValue,
}: {
  rows: Array<{ id: string; label: string; value: number }>
  highlightId?: string | null
  tone?: 'price' | 'lead'
  formatValue?: (value: number) => string
}) {
  const max = Math.max(...rows.map(row => row.value), 1)
  return (
    <div className="price-bars">
      {rows.map(row => {
        const width = Math.max(8, (row.value / max) * 100)
        const lead = highlightId === row.id
        return (
          <div key={row.id} className="price-bar-row">
            <div className="price-bar-label" title={row.label}>{row.label}</div>
            <div className="price-bar-track">
              <div
                className={`price-bar-fill tone-${tone} ${lead ? 'is-lead' : ''}`}
                style={{ width: `${width}%` }}
              />
            </div>
            {formatValue && (
              <div className="price-bar-value tnum">{formatValue(row.value)}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
