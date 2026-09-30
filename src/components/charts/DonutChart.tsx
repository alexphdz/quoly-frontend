export interface DonutSlice {
  key: string
  value: number
  color: string
  label: string
}

export default function DonutChart({
  slices,
  size = 112,
  thickness = 14,
  center,
}: {
  slices: DonutSlice[]
  size?: number
  thickness?: number
  center?: string
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const mid = size / 2
  let cursor = 0

  return (
    <svg
      className="donut-chart"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={slices.map(slice => `${slice.label} ${slice.value}`).join(', ')}
    >
      <circle
        cx={mid}
        cy={mid}
        r={radius}
        fill="none"
        stroke="var(--surface-muted)"
        strokeWidth={thickness}
      />
      {total > 0 && slices.map(slice => {
        const length = (slice.value / total) * circumference
        const dash = `${length} ${circumference - length}`
        const offset = -cursor
        cursor += length
        return (
          <circle
            key={slice.key}
            cx={mid}
            cy={mid}
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth={thickness}
            strokeDasharray={dash}
            strokeDashoffset={offset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${mid} ${mid})`}
          />
        )
      })}
      {center && (
        <text
          x={mid}
          y={mid}
          textAnchor="middle"
          dominantBaseline="central"
          className="donut-center"
        >
          {center}
        </text>
      )}
    </svg>
  )
}
