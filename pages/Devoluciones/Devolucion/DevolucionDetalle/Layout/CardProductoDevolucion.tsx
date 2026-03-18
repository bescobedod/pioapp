import React from 'react';
import { View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';


interface Props {
  producto: any;
  estado?: string;
}

export default function CardProductoDevolucion({ producto, estado }: Props) {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: producto.accion_tipo === 'pedir' ? theme.colors.primary : 
                     (Number(producto.cantidadDevolver) > 0 ? theme.colors.error : theme.colors.outlineVariant),
        borderWidth: (Number(producto.cantidadDevolver) > 0 || producto.accion_tipo === 'pedir') ? 1.5 : 1,
      }}
      className="flex-col rounded-2xl p-4 shadow-sm w-full mb-4">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 pr-2">
          <Text style={{ color: theme.colors.onSurface }} className="font-bold text-base mb-1">
            {producto.nombreProducto || 'Articulo sin nombre'}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Código: {producto.ItemCode}
          </Text>
        </View>
      </View>

      {/* Motive of return section */}
      {(producto.motivo_nombre || producto.motivo_devolucion) && (
        <View className="mb-3 mt-1">
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Motivo de devolución
          </Text>
          <Text style={{ color: theme.colors.error }} className="font-bold">
            {producto.motivo_nombre || producto.motivo_devolucion}
          </Text>
          {producto.nota_reclamo && (
            <View className="mt-1">
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Detalles del Reclamo:
              </Text>
              <Text style={{ color: theme.colors.onSurface }} className="font-bold">
                {producto.nota_reclamo}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Quantities section */}
      <View className="flex-col mt-2 pt-3 border-t border-gray-100">
        <View className="flex-row items-center justify-between mb-1">
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Recepcionado:</Text>
          <Text style={{ color: theme.colors.onSurface }} className="font-bold">
            {producto.cantidadReal} {producto.unidadMedida}
          </Text>
        </View>

        {estado === 'Aceptado' ? (
          <>
            {producto.cantidadDevolver > 0 && (
              <View className="flex-row items-center justify-between mb-1">
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Solicitado:</Text>
                <Text style={{ color: theme.colors.error }} className="font-bold">-{producto.cantidadDevolver} {producto.unidadMedidaDevolucion}</Text>
              </View>
            )}
            <View className="flex-row items-center justify-between mb-1">
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Aceptado:</Text>
              <Text style={{ color: '#4CAF50' }} className="font-bold">{producto.cantidadAceptada} {producto.unidadMedidaDevolucion}</Text>
            </View>
          </>
        ) : (
          producto.cantidadDevolver > 0 && (
            <View className="flex-row items-center justify-between mb-1">
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>A Devolver:</Text>
              <Text style={{ color: theme.colors.error }} className="font-bold">-{producto.cantidadDevolver} {producto.unidadMedidaDevolucion}</Text>
            </View>
          )
        )}

        {producto.piezas && producto.piezas.length > 0 && producto.id_devolucion_motivo !== 23 && (
          <View className="flex-col mt-2">
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
               Piezas Devueltas:
            </Text>
            <View className="flex-row flex-wrap mt-1">
              {producto.piezas.map((p: any, i: number) => (
                <View key={i} className="mr-3 mb-1 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                  <Text variant="bodySmall" className="font-bold" style={{ color: theme.colors.onSurface }}>
                    {p.id_pieza === 1 ? 'Pierna' : p.id_pieza === 2 ? 'Ala' : p.id_pieza === 3 ? 'Pechuga' : 'Cuadril'}: {p.cantidad}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
