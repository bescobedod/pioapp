import React from 'react';
import { View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

interface Props {
  producto: any;
}

export default function CardProductoDevolucion({ producto }: Props) {
  const theme = useTheme();

  return (
    <Surface className="mb-3 overflow-hidden rounded-lg" style={{ padding: 12 }}>
      <Text
        variant="titleSmall"
        className="font-bold"
        style={{ color: theme.colors.onSurface, marginBottom: 4 }}>
        {producto.nombreProducto || producto.ItemCode}
      </Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
        Código: {producto.ItemCode}
      </Text>
      <View className="flex-row justify-between">
        <View className="flex-1 items-center">
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Cant. Real
          </Text>
          <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
            {producto.cantidadReal}
          </Text>
        </View>
        <View className="flex-1 items-center">
          <Text variant="labelSmall" style={{ color: theme.colors.error }}>
            Cant. Devolver
          </Text>
          <Text variant="titleSmall" style={{ fontWeight: 'bold', color: theme.colors.error }}>
            {producto.cantidadDevolver}
          </Text>
        </View>
      </View>
    </Surface>
  );
}
