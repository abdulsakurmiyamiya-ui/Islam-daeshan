import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle, BookOpen } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      // Clear potentially corrupt cached chapter state if needed
      window.location.reload();
    } catch {
      this.setState({ hasError: false, error: null });
    }
  };

  private handleClearStorageAndReload = () => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#021810] text-[#fef3c7] flex items-center justify-center p-6 font-book">
          <div className="max-w-md w-full bg-gradient-to-b from-[#064e3b] to-[#011a14] border-2 border-amber-500/50 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h1 className="text-2xl font-heading font-bold text-[#fef08a] mb-2">
              इस्लाम दर्शन
            </h1>

            <p className="text-sm text-[#fef3c7]/80 mb-6">
              अनुप्रयोग लोड गर्दा प्राविधिक त्रुटि देखा पर्यो। कृपया पृष्ठ पुनः लोड गर्नुहोस्।
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#fef08a] to-[#f59e0b] text-[#064e3b] font-heading font-bold text-sm shadow-md hover:brightness-105 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                पृष्ठ पुनः लोड गर्नुहोस्
              </button>

              <button
                onClick={this.handleClearStorageAndReload}
                className="w-full py-2.5 rounded-xl border border-amber-500/30 text-amber-300 text-xs hover:bg-amber-500/10 transition cursor-pointer"
              >
                क्यास खाली गरी पुनः सुरु गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
