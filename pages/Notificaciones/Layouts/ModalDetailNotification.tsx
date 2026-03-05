import { LOGOAPP } from "assets/Providers/ImageProvider";
import AvatarImage from "components/Avatars/AvatarImage";
import ButtonForm from "components/form/ButtonForm";
import ListItemComponent from "components/List/ListItemComponent";
import ModalPortal from "components/Modals/ModalPortal";
import { NavigationService } from "helpers/navigator/navigationScreens";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { AppTheme } from "types/ThemeTypes";
import { Linking } from "react-native";
import { getUbicacionActual } from "helpers/ubicacion/ubicacionHelper";
import alertsState from "helpers/states/alertsState";
import { openWazeNavigation } from "helpers/Waze/WazeHelper";
import NotificacionAppType from "types/Notificaciones/NotificacionAppType";
import { generateJsonError, ResponseService } from "types/RequestType";
import { AJAX, URLPIOAPP } from "helpers/http/ajax";
import ResponseVisitaEmergenciaType, { ArchivosCasoType } from "types/VisitaEmergencia/ResponseVisitaEmergenciaType";
import { LatLng } from "react-native-maps";
import InfoAlert from "components/Alerts/InfoAlert";
import ToggleContainerAnimated from "components/Animaciones/ToggleContainerAnimated";
import ImageCarouselPortal from "components/Modals/ImageCarouselPortal";

type ModalDetailNotificationType = {
    portalModal: boolean;
    handleCloseTogglePortalModal: (() => void);
    notificationSelectActual: NotificacionAppType|null
}

export default function ModalDetailNotification({
    portalModal,
    handleCloseTogglePortalModal,
    notificationSelectActual
}: ModalDetailNotificationType) {

    const theme:AppTheme = useTheme() as AppTheme
    const { openVisibleSnackBar } = alertsState()
    const isTareaSupervisor = notificationSelectActual?.id_asunto_notificacion == 2
    const [loadingTareaSupervisor, setLoadingTareaSupervisor] = useState<boolean>(false)
    const [visitaEmergencia, setVisitaEmergencia] = useState<ResponseVisitaEmergenciaType|null>(null)
    const idVisitaEmergencia = notificationSelectActual?.dataPayload?.idVisitaEmergencia ?? '0'
    const [loadingButtonWaze, setLoadingButtonWaze] = useState<boolean>(false)
    //gurdar archvivos en un state cuando se carga la ruta
    const [archivosVisitaEmergencia, setArchivosVisitaEmergencia] = useState<ArchivosCasoType[]>([])
    //varable para controlar el open del carusel
    const [openCarouselImages, setOpenCarouselImages] = useState<boolean>(false)

    //obtner la visita emregencia actual
    const getVisitaEmergencia = async() : Promise<ResponseService<ResponseVisitaEmergenciaType>> => {
        try {
            const result = await AJAX(`${URLPIOAPP}/visita/emergencia/${idVisitaEmergencia}`, 'GET')
            return result
        } catch (error) {
            //si sucede un error seria mejor cerrar el modal actual
            handleCloseTogglePortalModal()
            openVisibleSnackBar(`${error}`, 'error')
            return generateJsonError(`${error}`, 'object')
        }
    }

    //obtener editar el estado de inicializacion de ruta a 2 (en Ruta)
    const putVisitaEmergencia = async(ubicacion:LatLng) : Promise<ResponseService<ResponseVisitaEmergenciaType>> => {
        try {
            const result = await AJAX(`${URLPIOAPP}/visita/emergencia/update/${idVisitaEmergencia}`, 'PUT', {
                id_estado: 2,
                last_gps_longitude: ubicacion.longitude,
                last_gps_latitude: ubicacion.latitude
            })
            return result
        } catch (error) {
            //si sucede un error seria mejor cerrar el modal actual
            handleCloseTogglePortalModal()
            openVisibleSnackBar(`${error}`, 'error')
            return generateJsonError(`${error}`, 'object')
        }
    }

    //funciona par boton de waze
    const HANDLE_TAP_BUTTON_WAZE = async () => {
        const ubicacionActual = await getUbicacionActual()
        if(!ubicacionActual) return openVisibleSnackBar(`Ooops ocurrio un error al obtener la Ubicacion porfavor verifice permisos y que la ubicacion este activa.`, 'error')
        //si la ruta ya fue inicada o terminada no volver a actualizar su estado solo actualizar si su estado es 1 
        if(visitaEmergencia?.id_estado != 1) {
            visitaEmergencia && openWazeNavigation(ubicacionActual,{ latitude: visitaEmergencia.new_gps_latitude, longitude: visitaEmergencia.new_gps_longitude })
            return
        }
        //actuliazr a esta 2 en ruta
        const resultIniciarRuta = await putVisitaEmergencia(ubicacionActual)
        //si falla no actualizar estado ni navegar a waze
        if(!resultIniciarRuta.status) return
        setVisitaEmergencia(resultIniciarRuta.data as ResponseVisitaEmergenciaType)
        openWazeNavigation(ubicacionActual,{ latitude: visitaEmergencia.new_gps_latitude, longitude: visitaEmergencia.new_gps_longitude })
    }

    //Funcion que se ejcuta al presionar el boton de Waze (VISITA EMERGENCIA)
    const handleOnpressRutaWaze = async () => {
        setLoadingButtonWaze(true)
        await HANDLE_TAP_BUTTON_WAZE()
        setLoadingButtonWaze(false)

    }

    //FUNCION que se ejecuta cuando le das click a llenar formulario (VISITA EMERGENCIA)
    const handleOnpressIngresoVisitaEmergencia = () => {
        handleCloseTogglePortalModal()
        NavigationService.navigate('SaveVisitas', { visitaEmergencia: visitaEmergencia ?? null })
    }

    //FUNCION PARA CARGAR LA INFORMACION Y VALIDACIONES DE LA VISITA EMERGENCIA
    const handleValidVisitaEmergencia = async () => {
        setLoadingTareaSupervisor(true)
        const visitaEmergencia = await getVisitaEmergencia()
        visitaEmergencia.status && setVisitaEmergencia(visitaEmergencia.data as ResponseVisitaEmergenciaType)
        visitaEmergencia.status && setArchivosVisitaEmergencia(visitaEmergencia.data?.archivos_caso ?? [])
        setLoadingTareaSupervisor(false)
    }

    const cleanHook = () => {
        setArchivosVisitaEmergencia([])
        setOpenCarouselImages(false)
    }

    const init = async() => {
        //limpiar hooke del componente
        cleanHook()
        //validar si el id del asunto es igual a 2
        isTareaSupervisor && await handleValidVisitaEmergencia()
    }

    useEffect(() => { init() }, [notificationSelectActual])

    return (
        <>
            <ModalPortal 
                visible={portalModal} 
                onDismiss={handleCloseTogglePortalModal}
                heightContainer={600}
                maxHeightContainer={600}
                header={
                    <View className="flex flex-row items-center justify-start gap-4">
                        <AvatarImage size={50} img={LOGOAPP}/>
                        <View className="w-full flex-col">
                            <Text style={{ color: theme.colors.primary }}>PIOAPP</Text>
                            <Text variant="bodySmall">{ notificationSelectActual?.AsuntoNotificacionModel?.name_asunto ?? ' -- ' }</Text>
                        </View>                        
                    </View>
                }
                footer={
                    <View className="w-full flex-col gap-2">

                        { 
                            isTareaSupervisor && (
                                <>
                                    { (visitaEmergencia?.id_estado == 3 && !loadingTareaSupervisor)
                                        && 
                                        <InfoAlert label="Esta tarea ya fue completada."/> 
                                    }

                                    { (!visitaEmergencia?.ingreso_visita_valid && !loadingTareaSupervisor)
                                        && 
                                        <InfoAlert label={`Esta tarea esta programada \n para la fecha ${visitaEmergencia?.fecha_programacion?.split('T')[0] ?? " -- "} \n debes completarla ese dia.`}/> 
                                    }

                                    <ButtonForm 
                                        // label="Iniciar Ruta"
                                        label={ 
                                            visitaEmergencia?.id_estado != 1 
                                                ? "Ver Ruta"
                                                : "Iniciar Ruta"
                                        } 
                                        icon="waze" 
                                        loading={loadingTareaSupervisor || loadingButtonWaze}
                                        disabled={
                                            loadingTareaSupervisor 
                                                || 
                                            loadingButtonWaze 
                                                || 
                                            visitaEmergencia?.id_estado == 3 
                                                || 
                                            !visitaEmergencia?.ingreso_visita_valid
                                        }
                                        buttonColor={theme.colors.skyBlue}
                                        onPress={handleOnpressRutaWaze}
                                    />
                                    <ButtonForm 
                                        label="Ingresar visita" 
                                        icon="clipboard-check" 
                                        loading={loadingTareaSupervisor}
                                        disabled={
                                            loadingTareaSupervisor 
                                                || 
                                            (visitaEmergencia?.id_estado != 2)
                                                || 
                                            !visitaEmergencia?.ingreso_visita_valid
                                        }
                                        onPress={handleOnpressIngresoVisitaEmergencia}
                                    />
                                </>
                            ) 
                        }
                
                    </View>
                }
            >
                <View className="w-full my-6">
                    {/* Modal para carrusel de imagenes */}
                    <ImageCarouselPortal 
                        visible={openCarouselImages} 
                        images={archivosVisitaEmergencia.flatMap(el=> `https://${el.s3_bucket}.s3.us-east-1.amazonaws.com/${el.s3_key}`)} 
                        onClose={() => setOpenCarouselImages(false)}
                    />

                    <ListItemComponent 
                        title="Titulo" 
                        description={ notificationSelectActual?.title ?? ' -- ' }
                    />
                    <ListItemComponent 
                        title="Descripcion" 
                        descriptionNumberOfLines={0}
                        description={ notificationSelectActual?.body ?? ' -- ' }
                    />
                    <ToggleContainerAnimated visible={archivosVisitaEmergencia.length > 0}>
                        <View className="mt-5 w-full items-center justify-center">
                            <Button 
                                icon={'camera'} 
                                mode="elevated" 
                                onPress={() => setOpenCarouselImages(true)}
                            >
                                Fotos ({ archivosVisitaEmergencia.length })
                            </Button>
                        </View>
                    </ToggleContainerAnimated>
                </View> 
            </ModalPortal>
        </>
    )
}