import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary component to gracefully handle unexpected runtime errors.
 * Prevents the application from crashing into a blank screen, displaying a structured
 * fallback UI with a quick reset mechanism while suppressing technical stack traces for standard users.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log development diagnostic information to console
    console.error('[OR ReadySync Error Boundary Caught Exception]:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-slate-100 font-sans">
          <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="h-8 w-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white">Operational Display Interrupted</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected interface anomaly occurred while processing operational readiness data. The system has prevented a full application crash to protect session state integrity.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-left text-xs space-y-1">
              <span className="font-bold text-slate-300 block text-[11px] uppercase tracking-wider">System Status Notice</span>
              <p className="text-slate-400">
                Session data remains securely saved in local storage. Click below to reload the synchronizer interface.
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg hover:bg-blue-500 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reload Synchronizer Interface</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
