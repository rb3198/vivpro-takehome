import React, { PropsWithChildren } from "react";
import styles from "./styles.module.scss";

type ErrorBoundaryProps = {
  /**
   * Message to be shown on encountering an error.
   */
  message?: string;
  tryAgain?: (...args: any[]) => unknown;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

class ErrorBoundary extends React.Component<
  PropsWithChildren<ErrorBoundaryProps>,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: !!error,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.warn(
      "Encountered the following error while trying to render",
      error,
      errorInfo.componentStack
    );
  }

  render() {
    const { hasError, error } = this.state;
    const { message, tryAgain, children } = this.props;
    if (hasError) {
      if (message || error?.message) {
        return (
          <div id={styles.error_container}>
            <h3>{message || error?.message}</h3>
            {tryAgain && <button onClick={tryAgain}>Try Again</button>}
          </div>
        );
      }
      return null;
    }
    return children;
  }
}

export default ErrorBoundary;
