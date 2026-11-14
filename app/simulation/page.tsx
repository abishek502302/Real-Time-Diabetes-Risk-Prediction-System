"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function SimulationPage() {

  const [bmi, setBmi] = useState(25)
  const [hba1c, setHba1c] = useState(5.5)
  const [glucose, setGlucose] = useState(225)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [simulatedRisk, setSimulatedRisk] = useState<number | null>(null)

  const [simHistory, setSimHistory] = useState([
    {
      label: "Current",
      probability: 0
    }
  ])

  const runSimulation = async () => {

    setLoading(true)
    setError("")

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            age: 45,
            bmi: bmi,
            HbA1c_level: hba1c,
            blood_glucose_level: glucose,
            hypertension: 0,
            heart_disease: 0,
            gender: "Male",
            smoking_history: "never"
          })
        }
      )

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // ✅ FIXED HERE
      const risk = data.probability * 100

      setSimulatedRisk(risk)

      setSimHistory([
        {
          label: "Current",
          probability: risk
        },
        {
          label: "Sim 1",
          probability: Math.min(risk + 10, 100)
        }
      ])

    } catch (err) {
      setError("Simulation failed")
    } finally {
      setLoading(false)
    }
  }

  const resetSimulation = () => {
    setBmi(25)
    setHba1c(5.5)
    setGlucose(225)
    setSimulatedRisk(null)
    setSimHistory([{ label: "Current", probability: 0 }])
  }

  return (

    <div className="container mx-auto px-4 py-8">

      <div className="mx-auto max-w-6xl">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            Future Risk Simulation
          </h1>

          <p className="text-muted-foreground mt-2">
            See how lifestyle changes affect risk
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          {/* LEFT PANEL */}
          <div className="lg:col-span-1">
            <div className="border rounded-xl p-8 shadow-sm">

              <h2 className="text-2xl font-bold mb-2">
                Adjust Parameters
              </h2>

              <p className="mb-8 text-muted-foreground">
                Modify health metrics
              </p>

              {/* BMI */}
              <div className="mb-8">
                <div className="flex justify-between mb-3">
                  <span>BMI</span>
                  <span>{bmi}</span>
                </div>

                <input
                  type="range"
                  min="15"
                  max="45"
                  value={bmi}
                  onChange={(e) => setBmi(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* HbA1c */}
              <div className="mb-8">
                <div className="flex justify-between mb-3">
                  <span>HbA1c</span>
                  <span>{hba1c}</span>
                </div>

                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.1"
                  value={hba1c}
                  onChange={(e) => setHba1c(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Glucose */}
              <div className="mb-8">
                <div className="flex justify-between mb-3">
                  <span>Glucose</span>
                  <span>{glucose}</span>
                </div>

                <input
                  type="range"
                  min="70"
                  max="300"
                  value={glucose}
                  onChange={(e) => setGlucose(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex gap-3">

                <button
                  onClick={runSimulation}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white p-3 rounded-lg"
                >
                  {loading ? "Simulating..." : "Run Simulation"}
                </button>

                <button
                  onClick={resetSimulation}
                  className="border px-4 rounded-lg"
                >
                  ↻
                </button>

              </div>

              {error && (
                <p className="text-red-500 mt-4">
                  {error}
                </p>
              )}

            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-2 space-y-6">

            {/* RESULT */}
            <div className="border rounded-xl p-8 shadow-sm text-center">

              <h2 className="text-2xl font-bold mb-2">
                Simulated Risk
              </h2>

              <p className="text-muted-foreground mb-8">
                Based on adjusted parameters
              </p>

              <h1 className="text-6xl font-bold">
                {simulatedRisk !== null
                  ? `${simulatedRisk.toFixed(2)}%`
                  : "No data"}
              </h1>

            </div>

            {/* GRAPH */}
            <div className="border rounded-xl p-8 shadow-sm">

              <h2 className="text-2xl font-bold mb-2">
                Risk Trajectory
              </h2>

              <p className="text-muted-foreground mb-6">
                Track simulated risk changes
              </p>

              <div className="h-[350px]">

                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, "Risk"]} />
                    <Line
                      type="monotone"
                      dataKey="probability"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}