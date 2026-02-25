import React, { useState } from 'react';
import { View, TouchableOpacity, Linking, Platform, Animated, LayoutAnimation, UIManager } from 'react-native';
import { Surface, Text, Button, IconButton, useTheme } from 'react-native-paper';
import { PublicacionType, postMarcarPublicacionLeida, ArchivoPublicacionType } from '../../helpers/http/Apis/PublicacionesApi';
import usePublicacionesState from '../../helpers/states/publicacionesState';
import alertsState from '../../helpers/states/alertsState';
import { FontAwesome5 } from '@expo/vector-icons';
import moment from 'moment';
import SecureFileViewerPortal from '../Modals/SecureFileViewerPortal';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  publicacion: PublicacionType;
  isHistory?: boolean;
}

export default function CardPublicacion({ publicacion, isHistory = false }: Props) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [isReadLocal, setIsReadLocal] = useState(publicacion.leido || false); // Only used when in History view
  const { removeFeedLocally } = usePublicacionesState();
  const { openVisibleSnackBar } = alertsState();

  const [viewerState, setViewerState] = useState<{ visible: boolean; url: string; type: string; name: string }>({
    visible: false,
    url: '',
    type: '',
    name: ''
  });

  const slideAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isHistory && publicacion.leido !== undefined) {
      setIsReadLocal(publicacion.leido);
    }
  }, [publicacion.leido, isHistory]);

  const handleMarcarLeida = async () => {
    // Si ya está leída localmente en el historial, no hacer nada
    if (isHistory && isReadLocal) return;

    setLoading(true);
    try {
      const resp = await postMarcarPublicacionLeida(publicacion.id_publicacion);
      if (resp.status) {
        if (isHistory) {
          // Si estamos en el historial, solo marcamos como leída localmente cambiando el icono
          setIsReadLocal(true);
          setLoading(false);
          openVisibleSnackBar('Publicación marcada como vista', 'success');
        } else {
          // Si estamos en el dashboard, animar hacia la izquierda y luego remover
          Animated.timing(slideAnim, {
            toValue: -800,
            duration: 350,
            useNativeDriver: true,
          }).start(() => {
            // Animar la reducción del espacio
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            removeFeedLocally(publicacion.id_publicacion);
          });
        }
      } else {
        openVisibleSnackBar('No se pudo marcar como leída', 'error');
        setLoading(false);
      }
    } catch (e) {
      openVisibleSnackBar('Error de conexión', 'error');
      setLoading(false);
    }
  };

  const handleOpenArchivo = (archivo: ArchivoPublicacionType) => {
    setViewerState({
      visible: true,
      url: archivo.url_archivo,
      type: archivo.tipo || 'unknown',
      name: archivo.nombre_archivo
    });
  };

  // Convert Color HEX from BD or fallback
  const catColor = publicacion.categoria?.color || theme.colors.primary;

  return (
    <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
      <Surface
        className="m-2 rounded-xl bg-white overflow-hidden shadow-sm"
        style={{
          borderTopWidth: 5,
          borderTopColor: catColor,
        }}
      >
        <View className="flex-row justify-between items-center p-4 pb-2">
          <View
            style={{ backgroundColor: `${catColor}20` }}
            className="px-3 py-1 rounded-full"
          >
            <Text style={{ color: catColor, fontWeight: 'bold', fontSize: 12 }}>
              {publicacion.categoria?.nombre || 'Anuncio'}
            </Text>
          </View>
          <Text variant="bodySmall" style={{ color: 'gray' }}>
            {moment(publicacion.createdAt).format('DD/MM/YYYY')}
          </Text>
        </View>

        <View className="px-4 py-2">
          <Text variant="titleMedium" className="font-bold mb-2">
            {publicacion.titulo}
          </Text>
          <Text variant="bodyMedium" style={{ color: '#4b5563' }}>
            {publicacion.mensaje}
          </Text>
        </View>

        {/* Attachments Section */}
        {publicacion.archivos && publicacion.archivos.length > 0 && (
          <View className="flex-row flex-wrap px-4 py-2 gap-2">
            {publicacion.archivos.map((archivo: ArchivoPublicacionType) => (
              <TouchableOpacity
                key={archivo.id_archivo_pub}
                onPress={() => handleOpenArchivo(archivo)}
                className="flex-row items-center border border-gray-200 rounded-md px-2 py-1 bg-gray-50"
              >
                <FontAwesome5
                  name={archivo.tipo === 'pdf' ? 'file-pdf' : archivo.tipo === 'video' ? 'video' : archivo.tipo === 'audio' ? 'file-audio' : 'file-image'}
                  size={12}
                  color="gray"
                  style={{ marginRight: 6 }}
                />
                <Text variant="bodySmall" numberOfLines={1} style={{ maxWidth: 100 }}>
                  {archivo.nombre_archivo}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Footer Actions */}
        <View className="flex-row justify-between items-center p-4 pt-2">
          <Button
            mode="outlined"
            onPress={() => {}} // Reservado para futura pantalla de detalle si se requiere
            style={{ flex: 1, marginRight: 8, borderColor: '#e5e7eb' }}
            textColor="#1f2937"
          >
            Ver Detalle
          </Button>
          <IconButton
            icon={isHistory ? (isReadLocal ? "check-circle-outline" : "eye-outline") : "check-circle-outline"}
            iconColor={isHistory && isReadLocal ? "gray" : theme.colors.primary}
            size={24}
            onPress={handleMarcarLeida}
            disabled={loading || (isHistory && isReadLocal)}
            style={{ backgroundColor: '#f3f4f6', margin: 0 }}
          />
        </View>
      </Surface>

      <SecureFileViewerPortal
        visible={viewerState.visible}
        url={viewerState.url}
        type={viewerState.type}
        name={viewerState.name}
        onClose={() => setViewerState((prev) => ({ ...prev, visible: false }))}
      />
    </Animated.View>
  );
}
