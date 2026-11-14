import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Brain, TrendingUp, BarChart3, Shield, Zap } from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: Activity,
      title: "Risk Assessment",
      description: "Get an instant diabetes risk score based on your health metrics using advanced ML algorithms.",
    },
    {
      icon: TrendingUp,
      title: "Future Simulation",
      description: "Simulate how lifestyle changes like BMI and glucose control could affect your future risk.",
    },
    {
      icon: BarChart3,
      title: "Data Insights",
      description: "Explore visualizations showing key risk factors and their impact on diabetes development.",
    },
    {
      icon: Brain,
      title: "AI Explanations",
      description: "Understand which factors contribute most to your prediction with interpretable AI insights.",
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              AI-Powered Health Assessment
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
              Predict Your <span className="text-primary">Diabetes Risk</span> with Machine Learning
            </h1>
            <p className="mt-6 text-lg text-muted-foreground text-pretty">
              Our advanced machine learning model analyzes your health metrics to provide accurate diabetes risk predictions, helping you take proactive steps towards better health.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="px-8">
                <Link href="/health-intake">
                  Start Assessment
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Comprehensive Health Analysis
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our platform offers multiple tools to help you understand and manage your diabetes risk.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-muted-foreground">
              Three simple steps to understand your diabetes risk
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Enter Your Data",
                description: "Input your health metrics including age, BMI, blood glucose levels, and medical history.",
              },
              {
                step: "02",
                title: "AI Analysis",
                description: "Our machine learning model processes your data and calculates your personalized risk score.",
              },
              {
                step: "03",
                title: "Get Insights",
                description: "Receive detailed results with risk level, contributing factors, and actionable recommendations.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Your Health Matters</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Take Control of Your Health Today
            </h2>
            <p className="text-muted-foreground mb-8">
              Early detection is key to preventing diabetes. Start your free assessment now and get personalized insights about your health.
            </p>
            <Button asChild size="lg" className="px-8">
              <Link href="/health-intake">
                Get Your Risk Assessment
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
