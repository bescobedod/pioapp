import { View } from 'react-native';
import PageLayout from 'components/Layouts/PageLayout';
import ScrollViewContainer from 'components/container/ScrollViewContainer';
import { useEffect, useState } from 'react';
import globalState from 'helpers/states/globalState';
import alertsState from 'helpers/states/alertsState';
import { getDevolucionDetalleByIdApi } from 'Apis/Devolucion/DevolucionQueryApi';
import { Text, useTheme } from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import EncabezadoDevolucion from './Layout/EncabezadoDevolucion';
import CardProductoDevolucion from './Layout/CardProductoDevolucion';

type ParamList = {
  Detail: { id_devolucion: number };
};

export default function DevolucionDetallePage() {
  const theme = useTheme();
  const route = useRoute<RouteProp<ParamList, 'Detail'>>();
  const { id_devolucion } = route.params;

  const [encabezado, setEncabezado] = useState<any>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const { openVisibleSnackBar } = alertsState();
  const { setOpenScreenLoading, setCloseScreenLoading } = globalState();

  const fetchDetalle = async () => {
    setOpenScreenLoading();
    const result = await getDevolucionDetalleByIdApi(id_devolucion);
    if (result.status) {
      setEncabezado(result.data?.encabezado ?? null);
      setProductos(result.data?.productos ?? []);
    } else {
      openVisibleSnackBar(result.message || 'Error al obtener el detalle', 'error');
    }
    setCloseScreenLoading();
  };

  useEffect(() => {
    fetchDetalle();
  }, [id_devolucion]);

  return (
    <PageLayout titleAppBar={`Devolución #${id_devolucion}`} goBack={true}>
      <ScrollViewContainer>
        <View className="flex-1 px-2 py-4">
          {/* Encabezado Card */}
          {encabezado && <EncabezadoDevolucion encabezado={encabezado} />}

          {/* Detalle / Comentario (fuera de la tarjeta) */}
          {encabezado?.detalle && (
            <View className="mb-4 px-2">
              <Text variant="labelLarge" style={{ color: theme.colors.primary, marginBottom: 4 }}>
                Detalle / Comentario
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {encabezado.detalle}
              </Text>
            </View>
          )}

          {/* Productos Devueltos */}
          <Text variant="titleMedium" style={{ color: theme.colors.primary, marginBottom: 12 }}>
            Productos Devueltos
          </Text>

          {productos.length === 0 ? (
            <View className="mt-4 items-center">
              <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>
                No hay productos registrados
              </Text>
            </View>
          ) : (
            productos.map((item: any, index: number) => (
              <CardProductoDevolucion 
                key={item.id_devolucion_detalle || index} 
                producto={item} 
                estado={encabezado?.estado}
              />
            ))
          )}
        </View>
      </ScrollViewContainer>
    </PageLayout>
  );
}
