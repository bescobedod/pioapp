import React from 'react';
import { View, Platform, Animated, LayoutAnimation, UIManager } from 'react-native';
import { Surface, Text, Button, useTheme } from 'react-native-paper';
import { PublicacionType } from '../../helpers/http/Apis/PublicacionesApi';
import { NavigationService } from '../../helpers/navigator/navigationScreens';
import moment from 'moment';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  publicacion: PublicacionType;
}

export default function CardPublicacion({ publicacion }: Props) {
  const theme = useTheme();

  const slideAnim = React.useRef(new Animated.Value(0)).current;

  const handleOpenDetalle = () => {
    // Solo permitimos abrir el detalle; el status updater se maneja en el PublicacionDetalleScreen
    NavigationService.navigate('PublicacionDetalle', { publicacion });
  };

  // Convert Color HEX from BD or fallback
  const catColor = publicacion.categoria?.color || theme.colors.primary;

  return (
    <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
      <Surface
        className="m-2 overflow-hidden rounded-xl"
        style={{
          borderTopWidth: 5,
          borderTopColor: catColor,
        }}>
        <View className="flex-row items-center justify-between p-4 pb-2">
          <View style={{ backgroundColor: `${catColor}20` }} className="rounded-full px-3 py-1">
            <Text style={{ color: catColor, fontWeight: 'bold', fontSize: 12 }}>
              {publicacion.categoria?.nombre || 'Anuncio'}
            </Text>
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {moment(publicacion.createdAt).locale('es').format('DD/MM/YYYY')}
          </Text>
        </View>

        <View className="px-4 py-2">
          <Text
            variant="titleMedium"
            numberOfLines={2}
            className="mb-2 font-bold"
            style={{ color: theme.colors.onSurface }}>
            {publicacion.titulo}
          </Text>
          <Text
            variant="bodyMedium"
            numberOfLines={3}
            style={{ color: theme.colors.onSurfaceVariant }}>
            {publicacion.mensaje}
          </Text>
        </View>

        {/* No attachments shown in main feed. User must enter Detail Screen. */}

        {/* Footer Actions */}
        <View className="flex-row items-center justify-between p-4 pt-2">
          <Button mode="contained-tonal" onPress={handleOpenDetalle} style={{ flex: 1 }}>
            Ver Detalle Completos
          </Button>
        </View>
      </Surface>
    </Animated.View>
  );
}
