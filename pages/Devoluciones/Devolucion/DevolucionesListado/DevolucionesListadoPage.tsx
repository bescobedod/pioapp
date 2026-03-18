import FabFloating from 'components/container/FabFloating';
import PageLayout from 'components/Layouts/PageLayout';
import { NavigationService } from 'helpers/navigator/navigationScreens';
import { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import { getDevolucionesByUserApi } from 'Apis/Devolucion/DevolucionQueryApi';
import alertsState from 'helpers/states/alertsState';
import globalState from 'helpers/states/globalState';
import { Text, useTheme, Chip } from 'react-native-paper';
import CardDevolucion, { getEstadoColor } from './Layout/CardDevolucion';

export default function DevolucionesListadoPage() {
  const theme = useTheme();
  const [devoluciones, setDevoluciones] = useState<any[]>([]);
  const [selectedEstado, setSelectedEstado] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const { openVisibleSnackBar } = alertsState();
  const { setOpenScreenLoading, setCloseScreenLoading } = globalState();

  const estadosDefinidos = ['Aceptado', 'Rechazado', 'En espera', 'Trasladado a revision'];

  const fetchDevoluciones = async () => {
    setOpenScreenLoading();
    const result = await getDevolucionesByUserApi();
    if (result.status) {
      setDevoluciones(result.data as any[]);
    } else {
      openVisibleSnackBar(result.message || 'Error al obtener las devoluciones', 'error');
    }
    setCloseScreenLoading();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const result = await getDevolucionesByUserApi();
    if (result.status) {
      setDevoluciones(result.data as any[]);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDevoluciones();
  }, []);

  const onRowPress = (rowItem: any) => {
    NavigationService.navigate('DevolucionDetalle', { id_devolucion: rowItem.id_devolucion });
  };

  const handleSelectEstado = (estado: string | null) => {
    setSelectedEstado(estado);
  };

  const devolucionesFiltradas = selectedEstado 
    ? devoluciones.filter(d => d.estado === selectedEstado) 
    : devoluciones;

  return (
    <>
      <PageLayout titleAppBar="Devoluciones">
        <View className="flex-1 px-4 py-4">
          
          {/* Horizontal Scroll Filter Menu */}
          <View style={{ marginBottom: 16, height: 40 }}>
            <GHScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, paddingRight: 20, alignItems: 'center' }}
              keyboardShouldPersistTaps="handled">
              <Chip
                selected={selectedEstado === null}
                onPress={() => handleSelectEstado(null)}
                style={{
                  marginRight: 8,
                  backgroundColor: selectedEstado === null ? theme.colors.primary : '#e0e0e0',
                }}
                textStyle={{ color: selectedEstado === null ? 'white' : 'black' }}>
                Todas
              </Chip>
              {estadosDefinidos.map((est) => {
                const estColor = getEstadoColor(est, theme.colors.primary);
                return (
                  <Chip
                    key={est}
                    selected={selectedEstado === est}
                    onPress={() => handleSelectEstado(est)}
                    style={{
                      marginRight: 8,
                      backgroundColor: selectedEstado === est ? estColor : '#e0e0e0',
                    }}
                    textStyle={{
                      color: selectedEstado === est ? 'white' : 'black',
                    }}>
                    {est}
                  </Chip>
                );
              })}
            </GHScrollView>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ paddingBottom: 100 }}>
            {devolucionesFiltradas.length === 0 ? (
              <View className="mt-10 items-center">
                <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>
                  No hay devoluciones para mostrar
                </Text>
              </View>
            ) : (
              devolucionesFiltradas.map((dev: any) => (
                <View key={dev.id_devolucion} className="mb-4">
                  <CardDevolucion devolucion={dev} onPress={onRowPress} />
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </PageLayout>
    </>
  );
}
