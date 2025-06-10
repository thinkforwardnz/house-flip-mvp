import React from 'react';
import { useToast } from '@/hooks/use-toast';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log error info to an error reporting service here
    // Optionally, trigger a toast notification
    // (Toast can't be called directly here, so use a fallback UI below)
    // console.error('Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI with a reset button
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <div className="bg-white p-8 rounded shadow text-center">
            <h2 className="text-xl font-bold mb-2 text-red-600">Something went wrong</h2>
            <p className="mb-4 text-gray-700">An unexpected error occurred. Please try refreshing the page.</p>
            {this.state.error && (
              <pre className="text-xs text-gray-400 mb-4 overflow-x-auto max-w-md mx-auto">
                {this.state.error.message}
              </pre>
            )}
            <button
              className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
              onClick={this.handleReset}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
} 