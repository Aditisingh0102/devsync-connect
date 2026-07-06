import React from "react";
import { useApp } from "@/lib/store";

type State = { hasError: boolean; error?: any };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // console log for dev
     
    console.error("Unhandled error captured by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="max-w-xl w-full bg-card p-6 rounded-xl border border-border">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mt-2">A runtime error occurred in the application. Check the browser console for details.</p>
            <pre className="mt-3 text-xs bg-surface-alt p-3 rounded text-foreground overflow-auto max-h-60">{String(this.state.error)}</pre>
            <div className="mt-4 flex justify-end">
              <button onClick={() => location.reload()} className="h-10 px-4 rounded-xl bg-primary text-white">Reload app</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
