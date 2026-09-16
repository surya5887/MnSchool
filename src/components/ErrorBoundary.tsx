import React, { ReactNode } from "react";
interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif" }}>
          <h2>Oops, something went wrong!</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>The app encountered an unexpected error or needs an update.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: "12px 24px", background: "#6366f1", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px" }}
          >
            Force Reload App
          </button>
          <div style={{ marginTop: "30px", padding: "20px", background: "#f8f9fa", borderRadius: "8px", textAlign: "left", fontSize: "12px", overflow: "auto", color: "#ef4444" }}>
            <pre>{this.state.error?.toString()}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
