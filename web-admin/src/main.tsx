import React, { Component, ErrorInfo, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { APIProvider } from "@vis.gl/react-google-maps";
import App from "./App.tsx";
import "./index.css";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in Web Admin Portal:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: "sans-serif", background: "#fff", color: "#333" }}>
          <h1 style={{ color: "#e11d48" }}>Web Admin UI Error Caught</h1>
          <p>An unexpected error occurred during rendering:</p>
          <pre style={{ background: "#f1f5f9", padding: 16, borderRadius: 8, overflowX: "auto" }}>
            {this.state.error?.toString()}
            {"\n"}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "10px 20px", marginTop: 20, background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || "";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      {apiKey ? (
        <APIProvider apiKey={apiKey} libraries={['visualization']}>
          <App />
        </APIProvider>
      ) : (
        <App />
      )}
    </ErrorBoundary>
  </React.StrictMode>
);
