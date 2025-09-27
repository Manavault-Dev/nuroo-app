/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import tw from '@/lib/design/tw';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for monitoring
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // In production, this would send to error monitoring service
    console.error('Error logged:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReportError = () => {
    const { error, errorInfo } = this.state;
    if (error && errorInfo) {
      // In production, this would open a feedback form or email
      Alert.alert(
        'Report Error',
        'Thank you for helping us improve the app. This error has been logged.',
        [{ text: 'OK' }]
      );
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return <ErrorFallback onRetry={this.handleRetry} onReport={this.handleReportError} />;
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback Component
 */
interface ErrorFallbackProps {
  onRetry: () => void;
  onReport: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ onRetry, onReport }) => {
  const { t } = useTranslation();

  return (
    <View style={tw`flex-1 justify-center items-center p-6 bg-gray-50`}>
      <View style={tw`bg-white rounded-2xl p-8 shadow-lg max-w-sm w-full`}>
        <View style={tw`items-center mb-6`}>
          <Text style={tw`text-6xl mb-4`}>😅</Text>
          <Text style={tw`text-xl font-bold text-gray-800 text-center mb-2`}>
            {t('error.something_went_wrong')}
          </Text>
          <Text style={tw`text-gray-600 text-center leading-6`}>
            {t('error.boundary_message')}
          </Text>
        </View>

        <View style={tw`space-y-3`}>
          <TouchableOpacity
            style={tw`bg-blue-500 rounded-xl py-4 px-6`}
            onPress={onRetry}
          >
            <Text style={tw`text-white font-semibold text-center text-lg`}>
              {t('error.try_again')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-gray-200 rounded-xl py-4 px-6`}
            onPress={onReport}
          >
            <Text style={tw`text-gray-700 font-semibold text-center text-lg`}>
              {t('error.report_issue')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={tw`mt-6 pt-6 border-t border-gray-200`}>
          <Text style={tw`text-sm text-gray-500 text-center`}>
            {t('error.support_text')}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ErrorBoundary;
