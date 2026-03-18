import React from 'react';
import { View } from 'react-native';
import { Surface, Text, Button, Icon, useTheme } from 'react-native-paper';
import moment from 'moment';

interface Props {
  devolucion: any;
  onPress: (dev: any) => void;
}

export const getEstadoColor = (estado: string, fallbackColor: string) => {
  if (estado === 'Aceptado') return '#4CAF50';
  if (estado === 'Rechazado') return '#F44336';
  if (estado === 'En espera') return '#FF9800';
  if (estado === 'Trasladado a revision') return '#2196F3';
  return fallbackColor;
};

export default function CardDevolucion({ devolucion, onPress }: Props) {
  const theme = useTheme();
  const tagColor = getEstadoColor(devolucion.estado || '', theme.colors.primary);
  const totalProductos = devolucion.total_productos ?? devolucion.totalProductos ?? null;

  return (
    <Surface className="m-2 overflow-hidden rounded-xl">
      <View className="flex-row items-center justify-between p-4 pb-2">
        <View style={{ backgroundColor: `${tagColor}20` }} className="rounded-full px-3 py-1">
          <Text style={{ color: tagColor, fontWeight: 'bold', fontSize: 12 }}>
            {devolucion.estado || 'Pendiente'}
          </Text>
        </View>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {moment(devolucion.createdAt).format('DD/MM/YYYY HH:mm')}
        </Text>
      </View>

      <View className="px-4 py-2">
        <Text
          variant="titleMedium"
          numberOfLines={2}
          className="mb-1 font-bold"
          style={{ color: theme.colors.onSurface }}>
          {devolucion.nombre_tienda}
        </Text>
        {devolucion.nombre_empresa && (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 2 }}>
            {devolucion.nombre_empresa}
          </Text>
        )}
        <View className="flex-row items-center justify-between mt-1">
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Folio: #{devolucion.id_devolucion}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Recepción: {devolucion.idEntradaInventario && devolucion.serieEntradaInventario ? `${devolucion.serieEntradaInventario}-${devolucion.idEntradaInventario}` : devolucion.id_recepcion}
          </Text>
        </View>
        {totalProductos !== null && (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
            Productos: {totalProductos}
          </Text>
        )}
        {devolucion.detalle && (
          <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.outline, marginTop: 4, fontStyle: 'italic' }}>
            {devolucion.detalle}
          </Text>
        )}
      </View>

      <View className="flex-row items-center justify-between p-4 pt-2">
        <Button mode="contained-tonal" onPress={() => onPress(devolucion)} style={{ flex: 1 }}>
          Ver Detalle
        </Button>
      </View>
    </Surface>
  );
}
