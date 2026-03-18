import React, { useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Text, Button, Divider, useTheme } from 'react-native-paper';
import moment from 'moment';
import SecureFileViewerPortal from 'components/Modals/SecureFileViewerPortal';

const getEstadoColor = (estado: string, fallbackColor: string) => {
  if (estado === 'Aceptado') return '#4CAF50';
  if (estado === 'Rechazado') return '#F44336';
  if (estado === 'En espera') return '#FF9800';
  if (estado === 'Trasladado a revision') return '#2196F3';
  return fallbackColor;
};

interface Props {
  encabezado: any;
}

export default function EncabezadoDevolucion({ encabezado }: Props) {
  const theme = useTheme();
  const tagColor = getEstadoColor(encabezado.estado || '', theme.colors.primary);

  const [viewerState, setViewerState] = useState<{
    visible: boolean;
    url: string;
    type: string;
    name: string;
  }>({ visible: false, url: '', type: '', name: '' });

  const openViewer = (url: string, type: string, name: string) => {
    setViewerState({ visible: true, url, type, name });
  };

  return (
    <View className="mb-4">
      {/* Estado + Fecha */}
      <View className="flex-row items-center justify-between pb-2">
        <View style={{ backgroundColor: `${tagColor}20` }} className="rounded-full px-3 py-1">
          <Text style={{ color: tagColor, fontWeight: 'bold', fontSize: 12 }}>
            {encabezado.estado || 'Pendiente'}
          </Text>
        </View>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {moment(encabezado.createdAt).format('DD/MM/YYYY HH:mm')}
        </Text>
      </View>

      {/* Tienda y Empresa */}
      <View className="pt-2">
        <Text variant="titleMedium" className="font-bold" style={{ color: theme.colors.onSurface }}>
          {encabezado.nombre_tienda}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {encabezado.nombre_empresa}
        </Text>
        {(encabezado.division || encabezado.divisionNombre) && (
          <Text variant="labelSmall" style={{ color: theme.colors.primary, opacity: 0.8, marginTop: 4, textTransform: 'uppercase' }}>
            {encabezado.divisionNombre || encabezado.division}
          </Text>
        )}
      </View>

      <Divider className="my-2" />

      {/* Info rows */}
      <View className="py-1">
        <View className="mb-1 flex-row justify-between">
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Folio Devolución
          </Text>
          <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
            {encabezado.id_devolucion}
          </Text>
        </View>
        <View className="mb-1 flex-row justify-between">
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Recepción
          </Text>
          <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
            {encabezado.id_recepcion || `Doc: ${encabezado.idEntradaInventario || '--'}`}
          </Text>
        </View>
        <View className="mb-1 flex-row justify-between">
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            ID Entrada Inventario
          </Text>
          <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
            {encabezado.idEntradaInventario || '--'}
          </Text>
        </View>
        {encabezado.tipo_balanza && (
          <View className="mb-1 flex-row justify-between">
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Tipo de Balanza
            </Text>
            <Text variant="bodyMedium" style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
              {encabezado.tipo_balanza}
            </Text>
          </View>
        )}
      </View>

      {/* Fotografía Temperatura */}
      {encabezado.fotografia_temperatura && (
        <>
          <Divider className="my-2" />
          <View className="py-1">
            <Text variant="labelMedium" style={{ color: theme.colors.primary, marginBottom: 8 }}>
              Fotografía Temperatura
            </Text>
            <TouchableOpacity
              onPress={() =>
                openViewer(encabezado.fotografia_temperatura, 'image', 'Fotografía Temperatura')
              }
              activeOpacity={0.8}>
              <Image
                source={{ uri: encabezado.fotografia_temperatura }}
                style={{ width: '100%', height: 200, borderRadius: 12 }}
                resizeMode="cover"
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                }}>
                <Text style={{ color: 'white', fontSize: 11 }}>🔒 Toca para ver</Text>
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Video Comprobante */}
      {encabezado.url_video_comprobante && (
        <>
          <Divider className="my-2" />
          <View className="py-2">

            <Text variant="labelMedium" style={{ color: theme.colors.primary, marginBottom: 8, marginTop: 8 }}>
              Video Comprobante
            </Text>
            <Button
              mode="outlined"
              icon="play-circle"
              onPress={() =>
                openViewer(encabezado.url_video_comprobante, 'video', 'Video Comprobante')
              }>
              Ver Video de forma segura
            </Button>
          </View>
        </>
      )}

      {/* Visor Seguro */}
      {viewerState.visible && (
        <SecureFileViewerPortal
          visible={viewerState.visible}
          url={viewerState.url}
          type={viewerState.type}
          name={viewerState.name}
          onClose={() => setViewerState((prev) => ({ ...prev, visible: false }))}
        />
      )}

      {/* Motivo de Rechazo */}
      {encabezado.estado === 'Rechazado' && encabezado.motivo_rechazo && (
        <>
          <Divider className="my-2" />
          <View className="py-2 px-1" style={{ backgroundColor: '#F4433615', borderRadius: 8 }}>
            <Text variant="labelMedium" style={{ color: '#F44336', fontWeight: 'bold' }}>
              Motivo de Rechazo
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, marginTop: 4 }}>
              {encabezado.motivo_rechazo}
            </Text>
          </View>
        </>
      )}

      <View style={{ height: 8 }} />
    </View>
  );
}
