import { View } from 'react-native';
// import { BottomNavKey from 'helpers/navigator/bottomNavigator'
import BoxImage from 'components/container/BoxImage';
import PageLayout from 'components/Layouts/PageLayout';
import { useCallback, useEffect, useRef, useState } from 'react';
import { generateJsonError, ResponseService } from 'types/RequestType';
import { AJAX, URLPIOAPP } from 'helpers/http/ajax';
import { NavigationService } from 'helpers/navigator/navigationScreens';
import { Button, Text } from 'react-native-paper';
import alertsState from 'helpers/states/alertsState';
import globalState from 'helpers/states/globalState';
import { orderRoutersMenu } from 'helpers/Global/HomeGlobalHelper';
import menuRouterState from 'helpers/states/menuRouterState';
import { useFocusEffect } from '@react-navigation/native';
import { initSocketGlobal } from 'Sockets/Global/GlobalSocket';
import { getValueStorage } from 'helpers/store/storeApp';
import { UserSessionType } from 'types/auth/UserSessionType';
import usePublicacionesState from 'helpers/states/publicacionesState';
import CardPublicacion from 'components/Cards/CardPublicacion';
import { ScrollView, RefreshControl } from 'react-native';
import SkeletonPublicaciones from './Layouts/SkeletonPublicaciones';
import { useTheme } from 'react-native-paper';

export type PermissionMenuType = {
  id_permission_menu?: number;
  id_categorias_menu?: number;
  id_menu_app?: number;
  id_rol?: number;
  id_type_menu?: number;
  name_category?: string;
  name_rol?: string;
  name_route?: string;
  name_type_menu?: string;
  title?: string;
};

export default function Home() {
  const { openVisibleSnackBar } = alertsState();
  const { setOpenScreenLoading, setCloseScreenLoading, setLoadingMenuInit } = globalState();
  const { setRouterMenu } = menuRouterState();
  const { dashboardFeeds, loadDashboardFeeds, isLoadingDashboard } = usePublicacionesState();
  const didInit = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardFeeds();
    setRefreshing(false);
  };

  const getMenusPermisssion = async (): Promise<ResponseService<PermissionMenuType[]>> => {
    try {
      const result: ResponseService<PermissionMenuType[]> = await AJAX(
        `${URLPIOAPP}/permissions/all`,
        'GET'
      );
      return result;
    } catch (error: any) {
      openVisibleSnackBar(`${error}`, 'error');
      return generateJsonError(`${error}`, 'array');
    }
  };

  const initalize = async () => {
    setLoadingMenuInit(true);
    // setOpenScreenLoading()
    const resultPermisos = await getMenusPermisssion();
    const dataOrder: any = orderRoutersMenu(resultPermisos.data as PermissionMenuType[]);
    // console.log(dataOrder)
    setRouterMenu(dataOrder);
    // setCloseScreenLoading()
    setLoadingMenuInit(false);
  };

  // useEffect(() => { initalize() }, [])

  useFocusEffect(
    useCallback(() => {
      if (!didInit.current) {
        initalize();
        didInit.current = true;
      }
      // Recargar publicaciones cada vez que entra al Home
      loadDashboardFeeds();
    }, [])
  );

  useEffect(() => {
    const user = getValueStorage('user') as UserSessionType;
    initSocketGlobal(user?.token ?? '');
  }, []);

  return (
    <>
      <PageLayout titleAppBar="Inicio">
        {/* <FabFloating onPress={() => NavigationService.navigate('SaveVisitas') }/> */}

        {/* <ScrollViewContainer> */}

        <View className="mt-2 flex w-full flex-1 flex-col px-[10]">
          {/* Loading State or Dashboard News Feed Vertical */}
          {isLoadingDashboard && !refreshing ? (
            <SkeletonPublicaciones />
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              contentContainerStyle={{
                paddingBottom: 100,
                paddingTop: 16,
                flexGrow: dashboardFeeds.length === 0 ? 1 : undefined,
              }}>
              {dashboardFeeds.length === 0 ? (
                <View className="mb-20 flex-1 flex-col items-center justify-center px-4">
                  <View
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.outlineVariant,
                    }}
                    className="w-full flex-col items-center justify-center rounded-2xl border p-8 shadow-sm">
                    <Text
                      variant="titleLarge"
                      style={{ color: theme.colors.onSurface }}
                      className="mb-3 text-center font-bold">
                      ¡Estás al día! 🎉
                    </Text>
                    <Text
                      variant="bodyLarge"
                      style={{ color: theme.colors.onSurfaceVariant }}
                      className="mb-8 text-center">
                      Has revisado todos tus avisos y comunicados pendientes.
                    </Text>
                    <Button
                      mode="contained"
                      icon="history"
                      className="w-full rounded-full py-1"
                      onPress={() => NavigationService.navigate('HistorialPublicaciones')}>
                      Ver Historial de Avisos
                    </Button>
                  </View>
                </View>
              ) : (
                <View className="w-full">
                  {dashboardFeeds.map((pub) => (
                    <View key={pub.id_publicacion} className="mb-4">
                      <CardPublicacion publicacion={pub} />
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* </ScrollViewContainer> */}
      </PageLayout>
    </>
  );
}
