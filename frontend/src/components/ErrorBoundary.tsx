// src/components/ErrorBoundary.tsx
import React from 'react';
import { reportFrontendError } from '../utils/errorReporter';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    reportFrontendError(error, {
      source: 'react_error_boundary',
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>
          <h2>Something went wrong.</h2>
          <p>Please refresh the page. Our team has been notified.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
