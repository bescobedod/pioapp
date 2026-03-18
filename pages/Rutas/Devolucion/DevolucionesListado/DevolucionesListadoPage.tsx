import FabFloating from 'components/container/FabFloating';
import ScrollViewContainer from 'components/container/ScrollViewContainer';
import PageLayout from 'components/Layouts/PageLayout';
import { NavigationService } from 'helpers/navigator/navigationScreens';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getDevolucionesByUserApi } from 'Apis/Devolucion/DevolucionQueryApi';
import alertsState from 'helpers/states/alertsState';
import globalState from 'helpers/states/globalState';
import { Text, useTheme } from 'react-native-paper';
import CardDevolucion from './Layout/CardDevolucion';

export default function DevolucionesListadoPage() {
  const theme = useTheme();
  const [devoluciones, setDevoluciones] = useState<any[]>([]);
  const { openVisibleSnackBar } = alertsState();
  const { setOpenScreenLoading, setCloseScreenLoading } = globalState();

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

  useEffect(() => {
    fetchDevoluciones();
  }, []);

  const onRowPress = (rowItem: any) => {
    NavigationService.navigate('DevolucionDetalle', { id_devolucion: rowItem.id_devolucion });
  };

  return (
    <>
      <FabFloating
        onPress={() => NavigationService.navigate('DevolucionCreacion')}
        icon="plus"
        label="Nueva devolucion"
        visible
      />

      <PageLayout titleAppBar="Devoluciones">
        <ScrollViewContainer>
          <View className="mt-4 px-2">
            {devoluciones.length === 0 ? (
              <View className="mt-10 items-center">
                <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>
                  No hay devoluciones registradas
                </Text>
              </View>
            ) : (
              devoluciones.map((dev: any) => (
                <CardDevolucion key={dev.id_devolucion} devolucion={dev} onPress={onRowPress} />
              ))
            )}
          </View>
        </ScrollViewContainer>
      </PageLayout>
    </>
  );
}
