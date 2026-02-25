import { View } from 'react-native'
// import { BottomNavKey from 'helpers/navigator/bottomNavigator'
import BoxImage from 'components/container/BoxImage'
import PageLayout from 'components/Layouts/PageLayout'
import { useCallback, useEffect, useRef } from 'react'
import { generateJsonError, ResponseService } from 'types/RequestType'
import { AJAX, URLPIOAPP } from 'helpers/http/ajax'
import { NavigationService } from 'helpers/navigator/navigationScreens'
import { Button, Text } from 'react-native-paper'
import alertsState from 'helpers/states/alertsState'
import globalState from 'helpers/states/globalState'
import { orderRoutersMenu } from 'helpers/Global/HomeGlobalHelper'
import menuRouterState from 'helpers/states/menuRouterState'
import { useFocusEffect } from '@react-navigation/native'
import { initSocketGlobal } from 'Sockets/Global/GlobalSocket'
import { getValueStorage } from 'helpers/store/storeApp'
import { UserSessionType } from 'types/auth/UserSessionType'
import usePublicacionesState from 'helpers/states/publicacionesState'
import CardPublicacion from 'components/Cards/CardPublicacion'
import { ScrollView } from 'react-native'
import SkeletonPublicaciones from './Layouts/SkeletonPublicaciones'

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
}

export default function Home(){

    const { openVisibleSnackBar } = alertsState()
    const { setOpenScreenLoading, setCloseScreenLoading, setLoadingMenuInit } = globalState()
    const { setRouterMenu } = menuRouterState()
    const { dashboardFeeds, loadDashboardFeeds, isLoadingDashboard } = usePublicacionesState()
    const didInit = useRef(false);

    const getMenusPermisssion = async():Promise<ResponseService<PermissionMenuType[]>> => {
        try {
            const result:ResponseService<PermissionMenuType[]> = await AJAX(`${URLPIOAPP}/permissions/all`, 'GET')
            return result
        } catch (error:any) {
            openVisibleSnackBar(`${error}`, 'error')
            return generateJsonError(`${error}`, 'array')
        }
    }

    const initalize = async() => {
        setLoadingMenuInit(true)
        // setOpenScreenLoading()
        const resultPermisos = await getMenusPermisssion()
        const dataOrder:any = orderRoutersMenu(resultPermisos.data as PermissionMenuType[])
        // console.log(dataOrder)
        setRouterMenu(dataOrder)
        // setCloseScreenLoading()
        setLoadingMenuInit(false)
    }

    // useEffect(() => { initalize() }, [])

    useFocusEffect(
      useCallback(() => {
        if (!didInit.current) {
          initalize()
          didInit.current = true;
        }
        // Recargar publicaciones cada vez que entra al Home
        loadDashboardFeeds();
      }, [])
    );

    useEffect(() => {
        const user = getValueStorage('user') as UserSessionType
        initSocketGlobal(user?.token ?? "")
    }, [])

    return (
        <>  
            <PageLayout>
            {/* <FabFloating onPress={() => NavigationService.navigate('SaveVisitas') }/> */}

            {/* <ScrollViewContainer> */}

                <View className='w-full mt-2 flex flex-col flex-1 px-[10]'>
                    {/* Loading State or Dashboard News Feed Vertical */}
                    {isLoadingDashboard ? (
                        <SkeletonPublicaciones />
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}>
                            {dashboardFeeds.length === 0 ? (
                                <View className="flex-col items-center justify-center mt-10 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <Text variant="titleMedium" className="font-bold text-center text-gray-700 mb-2">
                                        ¡Estás al día! 🎉
                                    </Text>
                                    <Text variant="bodyMedium" className="text-center text-gray-500 mb-6">
                                        Has revisado todos tus avisos y comunicados pendientes.
                                    </Text>
                                    <Button 
                                        mode="contained" 
                                        icon="history" 
                                        className="rounded-full w-full"
                                        onPress={() => NavigationService.navigate('HistorialPublicaciones')}
                                    >
                                        Ver Historial de Avisos
                                    </Button>
                                </View>
                            ) : (
                                <View className='w-full'>
                                    {dashboardFeeds.map(pub => (
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
    )
}