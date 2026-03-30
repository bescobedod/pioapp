import React, { useEffect, useState } from 'react';
import { View, Linking, StyleSheet, Platform, Image } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import Constants from 'expo-constants';
import { getConfigAppVersion } from 'Apis/Config/ConfigApi';
import PageLoadingInit from './PageLoadingInit';

interface ForceUpdateAppProps {
  children: React.ReactNode;
}

export default function ForceUpdateApp({ children }: ForceUpdateAppProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [playStoreUrl, setPlayStoreUrl] = useState('');
  const theme = useTheme();

  // Helper para comparar versiones semánticas ("1.1.0" > "1.0.5")
  const isVersionOutdated = (current: string, required: string) => {
    const v1 = current.split('.').map(Number);
    const v2 = required.split('.').map(Number);
    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      const num1 = v1[i] || 0;
      const num2 = v2[i] || 0;
      if (num1 < num2) return true;
      if (num1 > num2) return false;
    }
    return false; // Son iguales
  };

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await getConfigAppVersion();
        if (response.status && response.data) {
          const currentVersion = Constants.expoConfig?.version || '1.0.0';
          const requiredVersion = response.data.min_version || '1.0.0';
          
          if (isVersionOutdated(currentVersion, requiredVersion)) {
            setNeedsUpdate(true);
            setPlayStoreUrl(response.data.playstore_url);
          }
        }
      } catch (error) {
        console.warn('Error fetching app version config:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkVersion();
  }, []);

  const handleUpdatePress = () => {
    if (playStoreUrl) {
      Linking.openURL(playStoreUrl).catch((err) =>
        console.error('Error opening play store url:', err)
      );
    }
  };

  if (isChecking) {
    // Show splash screen equivalent while checking version over network
    return <PageLoadingInit />;
  }

  if (needsUpdate) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Image 
          source={require('../../assets/images/LOGOPINULITO.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={styles.title}>¡Actualización Requerida!</Text>
        <Text style={styles.subtitle}>
          Hemos lanzado una nueva versión de PioApp con increíbles mejoras operativas y correcciones de errores.
{"\n\n"}
          Para continuar usando la aplicación de forma segura, por favor actualiza a la última versión disponible.
        </Text>
        <Button 
          mode="contained" 
          onPress={handleUpdatePress}
          style={styles.button}
          contentStyle={{ paddingVertical: 8 }}
        >
          Actualizar Ahora
        </Button>
      </View>
    );
  }

  // Si no necesita actualización, renderizar la app normal
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  logo: {
    width: 250,
    height: 120,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    opacity: 0.8,
  },
  button: {
    width: '100%',
    borderRadius: 8,
  }
});
