type StepProgressProps = {
  current: number
  total: number
}

export function StepProgress({ current, total }: StepProgressProps) {
  const containerSize = 64
  const svgSize = 56
  const padding = (containerSize - svgSize) / 2

  const strokeWidth = 6
  const radius = (svgSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const progress = Math.min(Math.max(current / total, 0), 1)
  const dashOffset = circumference * (1 - progress)
  const center = svgSize / 2

  const isSafari =
    typeof window !== "undefined" &&
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

  return (
    <div
      className="w-16 h-16 box-border"
      style={{ padding }}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#F39416"
          strokeOpacity={0.2}
          strokeWidth={strokeWidth}
        />

        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#F39416"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />

        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="600"
          fill="#131927"
          dy={isSafari ? "0.35em" : "0.1em"}
        >
          <tspan>{current}</tspan>
          <tspan fillOpacity={0.4}>/{total}</tspan>
        </text>
      </svg>
    </div>
  )
}
