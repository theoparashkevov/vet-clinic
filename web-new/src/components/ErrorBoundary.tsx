import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "./ui/button"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          <div className="w-full max-w-md space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                We apologize for the inconvenience. Please try reloading the page.
              </p>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-left">
                <p className="font-mono text-sm font-semibold text-destructive">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="mt-2 max-h-48 overflow-auto text-xs text-destructive/80">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}
            <Button onClick={() => window.location.reload()}>
              Reload page
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
