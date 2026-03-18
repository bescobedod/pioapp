import CardContent from "components/Cards/CardContent";
import BoxImage from "components/container/BoxImage";
import ScrollViewContainer from "components/container/ScrollViewContainer";
import ButtonForm from "components/form/ButtonForm";
import PageLayout from "components/Layouts/PageLayout";
import ListItemComponent from "components/List/ListItemComponent";
import QrImgCode from "components/Qr/QrImgCode";
import Title from "components/typografy/Title";
import { View } from "react-native";
import { Icon, IconButton, List, Text, useTheme } from "react-native-paper";
import { imageConvivio2025 } from "assets/Providers/ImageProvider";
import { useEffect, useRef, useState } from "react";
import { getValueStorage, setValueStorage } from "helpers/store/storeApp";
import { UserSessionType } from "types/auth/UserSessionType";
import InfoAlert from "components/Alerts/InfoAlert";
import { AppTheme } from "types/ThemeTypes";
import TextInfo from "components/typografy/TextInfo";
import StorageConvivioType from "types/convivio/StorageConvivioType";
import PageToggleScreen from "components/Screens/PageToggleScreen";
import IconButtomForm from "components/form/IconButtomForm";
import alertsState from "helpers/states/alertsState";
import RNFS from 'react-native-fs';
import { addToGallery } from "helpers/Galery/GaleryHelper";

export default function ConvivioInvitacion() {

    const theme:AppTheme = useTheme() as AppTheme

    const qrRef = useRef<any>(null);

    const { openVisibleSnackBar } = alertsState()

    const [initialLoad, setInitialLoad] = useState(true)

    const [downloadingQr, setDownloadingQr] = useState<boolean>(false)

    const [user, setUser] = useState<UserSessionType | null>(null)

    const payloadConvivio:StorageConvivioType = { asistenciaConfirmada: false, QrView: false } 

    const [convivio, setConvivio] = useState<StorageConvivioType>(payloadConvivio)

    const hadleGetUser = () => {
        const userStorage:UserSessionType = getValueStorage('user') as UserSessionType
        setUser(userStorage)
    }

    const handleGetConvivio = () => {
        let convivioStorage:StorageConvivioType = getValueStorage('convivio') as StorageConvivioType
        
        convivioStorage && setConvivio(convivioStorage)
    }

    const handleDownloadQrGalery = async () : Promise<any> => {
        try {
            if (!qrRef.current)
                return openVisibleSnackBar(`El QR aún no está listo`, 'error')
          
            qrRef.current.toDataURL(async (data: string) => {
                const filePath = `${RNFS.PicturesDirectoryPath}/qr_${Date.now()}.png`
                await RNFS.writeFile(filePath, data, 'base64');
                await addToGallery(filePath);
                openVisibleSnackBar(`El QR se guardó en tu galería`, 'success')
            })
        } catch (error) {
            openVisibleSnackBar(`No se pudo guardar el QR`, 'error')
        }
    }

    const onPressButtonDownloadQr = async() => {
        setDownloadingQr(true)
        await handleDownloadQrGalery()
        setDownloadingQr(false)
    }

    useEffect(() => {
        if (!initialLoad) convivio && setValueStorage('convivio', convivio)
    }, [convivio])

    useEffect(() => {
        hadleGetUser()
        handleGetConvivio()
        setInitialLoad(false)
    }, [])

    return (
        <>
            {/* pagina toggle Qr */}
            <PageToggleScreen
                onPressIconClose={() => setConvivio(prev=>({ ...prev, QrView: !prev.QrView }))}
                visible={convivio.QrView}
            >
                <View className="w-full h-full relative flex flex-col gap-3 items-center justify-center px-10">
                    <View 
                        // className="bg-white p-2" 
                        style={{ position: 'relative' }}
                    >
                        {
                            (user?.id_users || '') && 
                            <>
                                <IconButtomForm 
                                    size={25}
                                    icon={'download'} 
                                    style={{ position: 'absolute', zIndex: 10, top: -20, right: -20 }}
                                    onPress={onPressButtonDownloadQr}
                                    loading={downloadingQr}
                                    disabled={downloadingQr}
                                />
                                <QrImgCode 
                                    value={JSON.stringify({
                                        codigo: Number(user?.id_users) || '',
                                        id_tipo_persona_convivio: 1
                                    })} 
                                    size={200} 
                                    getRef={(c) => (qrRef.current = c)}
                                    quietZone={7}
                                />
                            </>
                        }
                    </View>
                    <View className="flex flex-col items-center justify-center gap-2">
                        <Icon size={45} source={'food-turkey'}/>
                        <Title style={{ textAlign: 'center' }}>Juegos y Comida</Title>
                    </View>
                    <InfoAlert 
                        styleContent={{ position: 'absolute', bottom: 45, padding: 8 }}
                        label="Presente este Qr en el evento para consumir cualquiere tipo de alimento, bebida o juego."
                    />
                </View>
            </PageToggleScreen>

            {/* Pagina principal */}
            <PageLayout titleAppBar="Convivio">
                <ScrollViewContainer>
                    <View className="flex flex-col items-center gap-5 mt-3 mb-10">

                        <BoxImage img={imageConvivio2025} height={250} width={250}/>

                        <View>
                            <Title style={{ textAlign: 'center' }}>Convivio 2025</Title>
                            <TextInfo style={{ textAlign: 'center' }}>
                                ¡Estás cordialmente invitado al Convivio Anual 2025! ¡Te esperamos!
                            </TextInfo>
                        </View>

                        <CardContent className="w-full">
                            <ListItemComponent
                                className="w-full"
                                title="Fecha"
                                description="jueves 4 de diciembre"
                                rightElements={<List.Icon icon={'calendar'}/>}
                            />
                            <ListItemComponent
                                className="w-full"
                                title="Hora"
                                description="8:00 AM"
                                rightElements={<List.Icon icon={'clock'}/>}
                            />
                            <ListItemComponent
                                className="w-full"
                                title="Ubicacion"
                                description="Chalet bella vista villa canales"
                                rightElements={<List.Icon icon={'map'}/>}
                            />
                        </CardContent>         


                        <ButtonForm
                            className="w-full"
                            icon={
                                convivio.asistenciaConfirmada ? 
                                    "eye" : 
                                    "check-circle"
                            }
                            buttonColor={
                                convivio.asistenciaConfirmada ? 
                                    theme.colors.primary : 
                                    theme.colors.success
                            }
                            label={
                                convivio.asistenciaConfirmada ? 
                                    "Ver Invitacion" : 
                                    "Confirmar asistencia."
                            }
                            onPress={
                                convivio.asistenciaConfirmada ? 
                                () => setConvivio(prev => ({ ...prev, QrView: !prev.QrView })) :
                                () => setConvivio(prev => ({ QrView: true, asistenciaConfirmada: true }))
                            }
                        />                          

                    </View>
                </ScrollViewContainer>
            </PageLayout>
        </>
    )
}