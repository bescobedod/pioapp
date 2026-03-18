import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Title, Text, Button, useTheme, Surface } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import PageLayout from 'components/Layouts/PageLayout';
import * as ScreenCapture from 'expo-screen-capture';
import moment from 'moment';
import { AppTheme } from 'types/ThemeTypes';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  PublicacionType,
  ArchivoPublicacionType,
  postPublicacionEstado,
} from 'helpers/http/Apis/PublicacionesApi';
import alertsState from 'helpers/states/alertsState';
import { NavigationService } from 'helpers/navigator/navigationScreens';
import SecureFileViewerPortal from 'components/Modals/SecureFileViewerPortal';
import usePublicacionesState from 'helpers/states/publicacionesState';

type RouteParams = {
  publicacion: PublicacionType;
};

export default function PublicacionDetalleScreen() {
  const theme = useTheme() as AppTheme;
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { publicacion } = route.params;
  const { openVisibleSnackBar } = alertsState();
  const { removeFeedLocally } = usePublicacionesState();

  const [loading, setLoading] = useState(false);
  // Default to true if already understood, parsing safely in case API returns stringified INT
  const [entendido, setEntendido] = useState(Number(publicacion.estado) === 3);
  const [viewerState, setViewerState] = useState<{
    visible: boolean;
    url: string;
    type: string;
    name: string;
  }>({
    visible: false,
    url: '',
    type: '',
    name: '',
  });

  const catColor = publicacion.categoria?.color || theme.colors.primary;

  // 1. Bloqueo de Pantallas (Seguridad Principal)
  useEffect(() => {
    let isActive = true;
    const preventCapture = async () => {
      try {
        await ScreenCapture.preventScreenCaptureAsync();
      } catch (e) {
        console.warn('Screen capture prevention error:', e);
      }
    };
    preventCapture();

    return () => {
      isActive = false;
      ScreenCapture.allowScreenCaptureAsync().catch(() => {});
    };
  }, []);

  // 2. Reportar Estado 2 (Visto) silenciosamente al entrar SOLO SI NO HA SIDO LEIDO
  useEffect(() => {
    const reportarVisto = async () => {
      // Validar si tiene un fecha_leido (estado >= 2) para no actualizarlo
      if (Number(publicacion.estado) >= 2) return;

      try {
        await postPublicacionEstado(publicacion.id_publicacion, 2);
        // Remove locally from dashboard to prevent showing again
        removeFeedLocally(publicacion.id_publicacion);
      } catch (err) {
        console.warn('Failed to mark as viewed', err);
      }
    };
    reportarVisto();
  }, [publicacion.id_publicacion, publicacion.estado]);

  // 3. Acción Final: He Entendido (Estado 3)
  const handleEntendido = async () => {
    setLoading(true);
    try {
      const resp = await postPublicacionEstado(publicacion.id_publicacion, 3);
      if (resp.status) {
        setEntendido(true);
        openVisibleSnackBar('Confirmación registrada con éxito', 'success');
        setTimeout(() => NavigationService.goBack(), 1000); // Volver luego de confirmar
      } else {
        openVisibleSnackBar('No se pudo registrar la confirmación', 'error');
      }
    } catch (e) {
      openVisibleSnackBar('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenArchivo = (archivo: ArchivoPublicacionType) => {
    setViewerState({
      visible: true,
      url: archivo.url_archivo,
      type: archivo.tipo || 'unknown',
      name: archivo.nombre_archivo,
    });
  };

  return (
    <PageLayout titleAppBar="Detalles" goBack={true}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Encabezado */}
        <View className="mb-6">
          <View className="mb-4 flex-row items-center justify-between">
            <View style={{ backgroundColor: `${catColor}20` }} className="rounded-full px-3 py-1">
              <Text style={{ color: catColor, fontWeight: 'bold' }}>
                {publicacion.categoria?.nombre || 'General'}
              </Text>
            </View>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {moment(publicacion.createdAt).locale('es').format('DD MMMM YYYY, hh:mm A')}
            </Text>
          </View>

          <Title
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: theme.colors.onSurface,
              lineHeight: 30,
            }}
            className="mb-4">
            {publicacion.titulo}
          </Title>

          <Text
            variant="bodyLarge"
            style={{ color: theme.colors.onSurfaceVariant, lineHeight: 24 }}>
            {publicacion.mensaje}
          </Text>
        </View>

        {/* Archivos Adjuntos */}
        {publicacion.archivos && publicacion.archivos.length > 0 && (
          <View className="mb-6">
            <Text
              variant="titleMedium"
              style={{ fontWeight: 'bold', color: theme.colors.onSurface, marginBottom: 16 }}>
              Archivos Adjuntos
            </Text>

            <View className="flex-row flex-wrap gap-3">
              {publicacion.archivos.map((archivo) => (
                <TouchableOpacity
                  key={archivo.id_archivo_pub}
                  onPress={() => handleOpenArchivo(archivo)}
                  style={{
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.outlineVariant,
                    borderWidth: 1,
                  }}
                  className="w-full flex-row items-center rounded-xl p-3">
                  <View
                    style={{
                      backgroundColor: 'white',
                      padding: 10,
                      borderRadius: 10,
                      marginRight: 12,
                    }}>
                    <FontAwesome5
                      name={
                        archivo.tipo === 'pdf'
                          ? 'file-pdf'
                          : archivo.tipo === 'video'
                            ? 'video'
                            : archivo.tipo === 'audio'
                              ? 'file-audio'
                              : 'image'
                      }
                      size={20}
                      color={catColor}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      variant="bodyMedium"
                      style={{ fontWeight: 'bold', color: theme.colors.onSurface }}
                      numberOfLines={1}>
                      {archivo.nombre_archivo}
                    </Text>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Toca para visualizar de forma segura
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Botón de Acción He Entendido */}
        <View className="mb-4 mt-8">
          <Button
            mode="contained"
            icon={entendido ? 'check' : 'text-box-check-outline'}
            disabled={entendido || loading}
            loading={loading}
            onPress={handleEntendido}
            style={{
              borderRadius: 100,
              paddingVertical: 6,
              backgroundColor: entendido ? '#10b981' : theme.colors.primary,
            }}>
            {entendido ? 'Comprendido Registrado' : 'He Entendido'}
          </Button>
          <Text
            variant="labelSmall"
            style={{ textAlign: 'center', marginTop: 12, color: theme.colors.onSurfaceVariant }}>
            Al confirmar, tu organización sabrá que has leído y comprendido esta información.
          </Text>
        </View>
      </ScrollView>

      {/* Visor Seguro de Documentos */}
      {viewerState.visible && (
        <SecureFileViewerPortal
          visible={viewerState.visible}
          url={viewerState.url}
          type={viewerState.type}
          name={viewerState.name}
          onClose={() => setViewerState((prev) => ({ ...prev, visible: false }))}
        />
      )}
    </PageLayout>
  );
}
