"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  ScatterChart,
  Scatter,
} from "recharts"

// Feature importance data (typical for diabetes models)
const featureImportance = [
  { feature: "Blood Glucose", importance: 0.28 },
  { feature: "HbA1c Level", importance: 0.24 },
  { feature: "BMI", importance: 0.18 },
  { feature: "Age", importance: 0.12 },
  { feature: "Hypertension", importance: 0.08 },
  { feature: "Heart Disease", importance: 0.05 },
  { feature: "Smoking", importance: 0.03 },
  { feature: "Gender", importance: 0.02 },
]

// Risk distribution in population
const riskDistribution = [
  { name: "Low Risk", value: 65, color: "hsl(var(--risk-low))" },
  { name: "Medium Risk", value: 25, color: "hsl(var(--risk-medium))" },
  { name: "High Risk", value: 10, color: "hsl(var(--risk-high))" },
]

// Age group analysis
const ageGroupData = [
  { age: "18-30", diabetic: 2, nonDiabetic: 98 },
  { age: "31-40", diabetic: 5, nonDiabetic: 95 },
  { age: "41-50", diabetic: 12, nonDiabetic: 88 },
  { age: "51-60", diabetic: 22, nonDiabetic: 78 },
  { age: "61-70", diabetic: 30, nonDiabetic: 70 },
  { age: "70+", diabetic: 35, nonDiabetic: 65 },
]

// BMI vs Diabetes Risk
const bmiRiskData = [
  { bmi: 18, risk: 5 },
  { bmi: 20, risk: 4 },
  { bmi: 22, risk: 5 },
  { bmi: 24, risk: 8 },
  { bmi: 26, risk: 12 },
  { bmi: 28, risk: 18 },
  { bmi: 30, risk: 28 },
  { bmi: 32, risk: 38 },
  { bmi: 34, risk: 48 },
  { bmi: 36, risk: 55 },
  { bmi: 38, risk: 62 },
  { bmi: 40, risk: 68 },
]

// Glucose vs HbA1c scatter data
const glucoseHba1cData = [
  { glucose: 85, hba1c: 5.0, diabetic: false },
  { glucose: 92, hba1c: 5.2, diabetic: false },
  { glucose: 98, hba1c: 5.4, diabetic: false },
  { glucose: 105, hba1c: 5.6, diabetic: false },
  { glucose: 112, hba1c: 5.9, diabetic: false },
  { glucose: 118, hba1c: 6.1, diabetic: false },
  { glucose: 130, hba1c: 6.5, diabetic: true },
  { glucose: 145, hba1c: 7.0, diabetic: true },
  { glucose: 160, hba1c: 7.5, diabetic: true },
  { glucose: 180, hba1c: 8.2, diabetic: true },
  { glucose: 200, hba1c: 9.0, diabetic: true },
  { glucose: 220, hba1c: 9.5, diabetic: true },
]

export default function InsightsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Data Insights
          </h1>
          <p className="mt-2 text-muted-foreground">
            Explore statistical analysis and visualizations from diabetes research data
          </p>
        </div>

        <Tabs defaultValue="importance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="importance">Feature Importance</TabsTrigger>
            <TabsTrigger value="distribution">Risk Distribution</TabsTrigger>
            <TabsTrigger value="age">Age Analysis</TabsTrigger>
            <TabsTrigger value="correlation">Correlations</TabsTrigger>
          </TabsList>

          {/* Feature Importance Tab */}
          <TabsContent value="importance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Importance in Prediction</CardTitle>
                <CardDescription>
                  How much each health factor contributes to the diabetes risk prediction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={featureImportance}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        type="number"
                        domain={[0, 0.3]}
                        tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                      />
                      <YAxis type="category" dataKey="feature" width={90} />
                      <Tooltip
                        formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, "Importance"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="importance"
                        fill="hsl(var(--primary))"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Top Factor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">Blood Glucose</p>
                  <p className="text-sm text-muted-foreground">28% contribution</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Second Factor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">HbA1c Level</p>
                  <p className="text-sm text-muted-foreground">24% contribution</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Third Factor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">BMI</p>
                  <p className="text-sm text-muted-foreground">18% contribution</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Risk Distribution Tab */}
          <TabsContent value="distribution" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Population Risk Distribution</CardTitle>
                  <CardDescription>
                    How diabetes risk is distributed across the general population
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`${value}%`, "Population"]}
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Statistics</CardTitle>
                  <CardDescription>Important diabetes facts and figures</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-risk-low/10 p-4">
                    <p className="font-semibold text-risk-low">Low Risk (65%)</p>
                    <p className="text-sm text-muted-foreground">
                      Healthy individuals with normal glucose levels and BMI
                    </p>
                  </div>
                  <div className="rounded-lg bg-risk-medium/10 p-4">
                    <p className="font-semibold text-risk-medium">Medium Risk (25%)</p>
                    <p className="text-sm text-muted-foreground">
                      Pre-diabetic range with elevated but manageable metrics
                    </p>
                  </div>
                  <div className="rounded-lg bg-risk-high/10 p-4">
                    <p className="font-semibold text-risk-high">High Risk (10%)</p>
                    <p className="text-sm text-muted-foreground">
                      Significant risk factors requiring immediate intervention
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Age Analysis Tab */}
          <TabsContent value="age" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Diabetes Prevalence by Age Group</CardTitle>
                <CardDescription>
                  How diabetes risk increases with age in the population
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageGroupData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="age" />
                      <YAxis tickFormatter={(v) => `${v}%`} />
                      <Tooltip
                        formatter={(value: number) => [`${value}%`]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="diabetic"
                        name="Diabetic"
                        fill="hsl(var(--risk-high))"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="nonDiabetic"
                        name="Non-Diabetic"
                        fill="hsl(var(--risk-low))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Key Insight:</strong> Diabetes risk increases significantly after age 40, with the highest prevalence in the 70+ age group. Regular screening becomes crucial as you age.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Correlations Tab */}
          <TabsContent value="correlation" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>BMI vs Diabetes Risk</CardTitle>
                  <CardDescription>
                    Relationship between body mass index and diabetes probability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={bmiRiskData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="bmi"
                          label={{ value: "BMI (kg/m²)", position: "bottom" }}
                        />
                        <YAxis
                          tickFormatter={(v) => `${v}%`}
                          label={{ value: "Risk %", angle: -90, position: "insideLeft" }}
                        />
                        <Tooltip
                          formatter={(value: number) => [`${value}%`, "Risk"]}
                          labelFormatter={(label) => `BMI: ${label}`}
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="risk"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Glucose vs HbA1c Correlation</CardTitle>
                  <CardDescription>
                    Scatter plot showing relationship between blood markers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="glucose"
                          name="Glucose"
                          type="number"
                          domain={[60, 240]}
                          label={{ value: "Glucose (mg/dL)", position: "bottom" }}
                        />
                        <YAxis
                          dataKey="hba1c"
                          name="HbA1c"
                          type="number"
                          domain={[4, 10]}
                          label={{ value: "HbA1c (%)", angle: -90, position: "insideLeft" }}
                        />
                        <Tooltip
                          cursor={{ strokeDasharray: "3 3" }}
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Scatter
                          data={glucoseHba1cData.filter((d) => !d.diabetic)}
                          fill="hsl(var(--risk-low))"
                          name="Non-Diabetic"
                        />
                        <Scatter
                          data={glucoseHba1cData.filter((d) => d.diabetic)}
                          fill="hsl(var(--risk-high))"
                          name="Diabetic"
                        />
                        <Legend />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Key Insight:</strong> There is a strong positive correlation between blood glucose and HbA1c levels. Maintaining both within normal ranges is crucial for diabetes prevention.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
