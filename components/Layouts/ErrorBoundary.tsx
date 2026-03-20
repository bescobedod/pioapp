import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Surface, useTheme } from 'react-native-paper';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const FallbackUI = ({ onReset, error, errorInfo }: { onReset: () => void; error: Error | null; errorInfo: ErrorInfo | null }) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.surface, { backgroundColor: theme.colors.surface, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 }]}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.error }]}>
          Crash Detectado
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginBottom: 10 }}>
          Este es el error exacto que cerraba tu app:
        </Text>
        
        <ScrollView style={{maxHeight: 250, width: '100%', marginBottom: 20, backgroundColor: '#ffebee', padding: 10, borderRadius: 8}}>
          <Text style={{ color: '#b71c1c', fontWeight: 'bold' }}>
            {error ? error.toString() : 'Error desconocido'}
          </Text>
          <Text style={{ color: '#c62828', fontSize: 10, marginTop: 10 }}>
            {errorInfo ? errorInfo.componentStack : ''}
          </Text>
        </ScrollView>
        
        <Button 
          mode="contained" 
          onPress={onReset}
          style={{ width: '100%', borderRadius: 10 }}
        >
          Intentar Recargar
        </Button>
      </View>
    </View>
  );
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return <FallbackUI onReset={this.handleReset} error={this.state.error} errorInfo={this.state.errorInfo} />;
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  surface: {
    padding: 24,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 12,
  }
});
