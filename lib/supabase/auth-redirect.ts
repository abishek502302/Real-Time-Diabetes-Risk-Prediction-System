export const APP_BASE_PATH =
  process.env.NODE_ENV === "production"
    ? "/Real-Time-Diabetes-Risk-Prediction-System"
    : ""

export function appPath(path: string): string {
  return `${APP_BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`
}

export function getAuthCallbackUrl(origin: string): string {
  return new URL(appPath("/auth/callback"), origin).toString()
}
