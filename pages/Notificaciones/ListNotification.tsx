import Accordion from "components/Accordion/Accordion";
import ScrollViewContainer from "components/container/ScrollViewContainer";
import PageLayout from "components/Layouts/PageLayout";
import FlatListVirtualize from "components/List/FlatListVirtualize";
import ListItemComponent from "components/List/ListItemComponent";
import ListSubheader from "components/List/ListSubheader";
import TouchRipple from "components/Touch/TouchRipple";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { ActivityIndicator, Badge, Icon, Text, useTheme } from "react-native-paper";
import { AppTheme } from "types/ThemeTypes";
import ModalDetailNotification from "./Layouts/ModalDetailNotification";
import { getValueStorage } from "helpers/store/storeApp";
import { UserSessionType } from "types/auth/UserSessionType";
import { disconnectSocketNotification, initSocketNotification } from "Sockets/Notificaciones/NotificacionesSocket";
import notificationState from "helpers/states/notificationState";
import NotificacionAppType from "types/Notificaciones/NotificacionAppType";
import { generateJsonError, ResponseService } from "types/RequestType";
import alertsState from "helpers/states/alertsState";
import { AJAX, URLPIOAPP } from "helpers/http/ajax";
import ChipDecoration from "components/decoration/ChipDecoration";
import TextInfo from "components/typografy/TextInfo";
import Title from "components/typografy/Title";
import NotificationLayout from "./Layouts/NotificationLayout";
import SkeletonNotifications from "./Layouts/SkeletonNotifications";
import SkeletonPreviousNotification from "./Layouts/SkeletonPreviousNotification";

type NotisFilterType = 'hoy'|'anteriores'

export default function ListNotification () {

    const theme:AppTheme = useTheme() as AppTheme
    const { openVisibleSnackBar } = alertsState()
    const [chargeNotisPrevious, setChargeNotisPrevious] = useState<boolean>(false)
    const { notificacionesToday, loadingNotificationToday, setloadingNotificationToday, setNotifications } = notificationState()
    const [notificationSelectActual, setNotificationSelectActual] = useState<NotificacionAppType|null>(null)
    const [responseNotificationsPrevious, setResponseNotificationsPrevious] = useState<ResponseService<NotificacionAppType[]>|null>(null);
    // const [accordionHoy, setAccordionHoy] = useState<boolean>(true);
    const [portalModal, setPortalModal] = useState<boolean>(false);
    const notificacionesHoyNoLeidas:number = notificacionesToday?.filter(({ leido }) => !leido)?.length ?? 0
    const notificacionesPreviousNoLeidas:number = responseNotificationsPrevious?.data?.filter(({ leido }) => !leido)?.length ?? 0
    const [chipSelect, setChipSelect] = useState<NotisFilterType>('hoy')
    const notisNoLeidasText = notificacionesHoyNoLeidas > 0 ? `(${notificacionesHoyNoLeidas})` : ''
    const notisNoleidasPreviousText = notificacionesPreviousNoLeidas > 0 ? `(${notificacionesPreviousNoLeidas})` : ''
    //validaccion
    const isHoy = chipSelect === 'hoy'
    const isAnteriores = chipSelect === 'anteriores'

    // const handleToggleAccordionHoy = () => setAccordionHoy(!accordionHoy)

    const handleCloseTogglePortalModal = () => setPortalModal(false)

    const postMarkedReadNotification = async (id_notificacion_app:number) : Promise<ResponseService<NotificacionAppType>> => {
        try {
            const result = await AJAX(`${URLPIOAPP}/notificaciones/read`, 'POST', {
                id_notificacion_app
            })
            return result
        } catch (error) {
            openVisibleSnackBar(`${error}`, 'error')
            return generateJsonError(`${error}`, 'object')
        }
    }

    const getPreviousNotifications = async () : Promise<ResponseService<NotificacionAppType[]>> => {
        try {
            const result = await AJAX(`${URLPIOAPP}/notificaciones/previous`)
            return result
        } catch (error) {
            openVisibleSnackBar(`${error}`, 'error')
            return generateJsonError(`${error}`, 'array')
        }
    }

    const handleOpenTogglePortalModal = async (data:NotificacionAppType, typeNoti:NotisFilterType = 'hoy') => {
        setNotificationSelectActual({...data})
        setPortalModal(true)
        if(data.leido) return
        //marcar como leido una notificacion
        const result = await postMarkedReadNotification(data.id_notificacion_app)
        //setear estado solo de las de notificaciones "anteriores"
        if(typeNoti === 'hoy') return
        result.status && setResponseNotificationsPrevious(prevState => {
            if (!prevState) return prevState
            const notisActualizadas = prevState.data?.map(item => 
              item.id_notificacion_app === data.id_notificacion_app 
                ? { ...item, leido: true } 
                : item
            )
            return {
              ...prevState,
              data: notisActualizadas
            }
      })
    }

    const getTokenAuth = () : string => {
        const user:UserSessionType = getValueStorage('user') as UserSessionType
        return `${user.token}`
    }

    const init = async() => {
        setloadingNotificationToday(true)
        const token = getTokenAuth()
        initSocketNotification(token)
    }

    const onChangeChipSelect = async () => {
        if(chipSelect === 'hoy') return
        if(responseNotificationsPrevious) return
        setChargeNotisPrevious(true)
        const resultPreviousNotification = await getPreviousNotifications()
        setResponseNotificationsPrevious(resultPreviousNotification)
        setChargeNotisPrevious(false)
    }

    useEffect(() => { onChangeChipSelect() }, [chipSelect])

    useEffect(() => {
        init()
        return () => {
            setNotifications([])
            disconnectSocketNotification()
        }
    }, [])

    return (
        <>
            <ModalDetailNotification 
                handleCloseTogglePortalModal={handleCloseTogglePortalModal} 
                portalModal={portalModal}
                notificationSelectActual={notificationSelectActual}
            />

            <PageLayout 
                titleAppBar="Notificaciones" 
                menuApp={false} 
                notification={false} 
                themeApp={false} 
                goBack={true}
            >
                <ScrollViewContainer paddingHorizontal={25}>
                    {
                        loadingNotificationToday 
                            ? <SkeletonNotifications/>
                            :
                            <View className="w-full mt-6 mb-10">
                                {/* Chip filters */}
                                <View className="w-full flex-row gap-2 mb-8">
                                    <ChipDecoration 
                                        title="Hoy" 
                                        mode={isHoy ? 'flat' : 'outlined'} 
                                        icon={isHoy ? 'check' : ''} 
                                        onPress={() => setChipSelect('hoy')}
                                        style={{ ...(isHoy ? { backgroundColor: theme.colors.surfaceVariant } : {}) }}
                                    />
                                    <ChipDecoration 
                                        title="Anteriores" 
                                        mode={isAnteriores ? 'flat' : 'outlined'} 
                                        icon={isAnteriores ? 'check' : ''} 
                                        onPress={() => setChipSelect('anteriores')}
                                        style={{ ...(isAnteriores ? { backgroundColor: theme.colors.surfaceVariant } : {}) }}
                                    />
                                </View>
                                <Text  
                                    variant="titleMedium"
                                    style={{ color: theme.colors.primary, marginBottom: 15, }}
                                >
                                    { isHoy && `Hoy ${ notisNoLeidasText }` }
                                    { isAnteriores && `Anteriores ${ notisNoleidasPreviousText }` }
                                </Text>

                                { isHoy && 
                                    <NotificationLayout 
                                        notifications={notificacionesToday} 
                                        onPressNoti={(item) => handleOpenTogglePortalModal(item, 'hoy')}
                                    /> 
                                }

                                { isAnteriores && 
                                    (
                                        chargeNotisPrevious 
                                            ? 
                                            // <View className="w-full flex-row items-center justify-center gap-2" style={{ marginTop: 20 }}>
                                            //     <Text>...cargando</Text>
                                            //     <ActivityIndicator animating={true} size={20}/>
                                            // </View>
                                            <SkeletonPreviousNotification/>
                                            : 
                                            <NotificationLayout 
                                                notifications={responseNotificationsPrevious?.data ?? []} 
                                                onPressNoti={(item) => handleOpenTogglePortalModal(item, 'anteriores')}
                                            />                     
                                    )
                                }

                            </View>
                    }
                    
                </ScrollViewContainer>
            </PageLayout>
        </>
    )
}