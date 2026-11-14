import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, Brain, Code, Target, CheckCircle, BookOpen } from "lucide-react"

export default function AboutPage() {
  const techStack = [
    { name: "Next.js 16", category: "Frontend" },
    { name: "React 19", category: "Frontend" },
    { name: "TypeScript", category: "Language" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "shadcn/ui", category: "Components" },
    { name: "Recharts", category: "Visualization" },
    { name: "Python/FastAPI", category: "Backend" },
    { name: "scikit-learn", category: "ML" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            About This Project
          </h1>
          <p className="mt-2 text-muted-foreground">
            Understanding the methodology behind our diabetes risk prediction system
          </p>
        </div>

        <div className="space-y-8">
          {/* Problem Statement */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>Problem Statement</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-muted-foreground">
                Diabetes mellitus is one of the most prevalent chronic diseases worldwide, affecting over 463 million adults globally. Early detection and prevention are crucial, as undiagnosed or poorly managed diabetes can lead to severe complications including heart disease, kidney failure, blindness, and lower limb amputation.
              </p>
              <p className="text-muted-foreground mt-4">
                This project aims to develop an accessible, AI-powered tool that can help individuals assess their diabetes risk using readily available health metrics. By leveraging machine learning, we can identify at-risk individuals earlier, enabling timely lifestyle interventions and medical consultations.
              </p>
            </CardContent>
          </Card>

          {/* Methodology */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle>Methodology</CardTitle>
              </div>
              <CardDescription>Our machine learning approach</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Model Selection</h4>
                <p className="text-sm text-muted-foreground">
                  We evaluated multiple classification algorithms including Logistic Regression, Random Forest, Gradient Boosting, and Neural Networks. The final model was selected based on a balance of accuracy, interpretability, and generalization capability.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Feature Engineering</h4>
                <p className="text-sm text-muted-foreground">
                  The model uses 8 key features: gender, age, hypertension status, heart disease status, smoking history, BMI, HbA1c level, and blood glucose level. These features were selected based on their clinical relevance and predictive power for diabetes.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Training & Validation</h4>
                <p className="text-sm text-muted-foreground">
                  The model was trained using stratified k-fold cross-validation to ensure robust performance across different data distributions. Hyperparameters were optimized using grid search with cross-validation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dataset */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>Dataset Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-2xl font-bold text-primary">100,000+</p>
                  <p className="text-sm text-muted-foreground">Patient Records</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-2xl font-bold text-primary">8</p>
                  <p className="text-sm text-muted-foreground">Input Features</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-2xl font-bold text-primary">~91%</p>
                  <p className="text-sm text-muted-foreground">Model Accuracy</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-2xl font-bold text-primary">0.89</p>
                  <p className="text-sm text-muted-foreground">ROC-AUC Score</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                The dataset includes anonymized health records with demographic information, medical history, and laboratory measurements. Data preprocessing included handling missing values, outlier detection, and feature normalization.
              </p>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                <CardTitle>Technology Stack</CardTitle>
              </div>
              <CardDescription>Built with modern technologies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <Badge key={tech.name} variant="secondary">
                    {tech.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Project Goals */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <CardTitle>Project Goals & Outcomes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "Develop an accurate and reliable diabetes risk prediction model",
                  "Create an intuitive user interface for easy health metric input",
                  "Provide interpretable AI explanations for predictions",
                  "Enable what-if scenario simulations for health planning",
                  "Offer educational content about diabetes prevention",
                  "Demonstrate practical application of ML in healthcare",
                ].map((goal, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{goal}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Limitations */}
          <Card className="border-risk-medium/50 bg-risk-medium/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-risk-medium" />
                <CardTitle>Limitations & Disclaimer</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• This tool is for educational and informational purposes only</li>
                <li>• Predictions should not replace professional medical diagnosis</li>
                <li>• The model may not account for all diabetes risk factors</li>
                <li>• Results are probabilistic estimates, not definitive diagnoses</li>
                <li>• Always consult healthcare professionals for medical advice</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
