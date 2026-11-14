
"use client"

type Props = {
  data: {
    probability: number
    risk_level: string
  }
}

export function RiskGauge({ data }: Props) {
  if (!data || data.probability === undefined) {
    return <p>No data</p>
  }

  // convert 0–1 → percentage
  const risk = data.probability * 100

  let color = "#22c55e" // green
  if (risk > 60) color = "#ef4444" // red
  else if (risk > 30) color = "#f59e0b" // yellow

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Risk Score</h2>

      <svg width="200" height="120">
        <path
          d="M10 100 A90 90 0 0 1 190 100"
          fill="none"
          stroke="#eee"
          strokeWidth="15"
        />

        <path
          d="M10 100 A90 90 0 0 1 190 100"
          fill="none"
          stroke={color}
          strokeWidth="15"
          strokeDasharray={`${risk * 2.8}, 1000`}
        />
      </svg>

      <h3>{!isNaN(risk) ? risk.toFixed(2) : "0"}%</h3>
      <p>{data.risk_level}</p>
    </div>
  )
}