import { yupResolver } from "@hookform/resolvers/yup";
import FormAdaptiveKeyBoard from "components/container/FormAdaptiveKeyBoard";
import ScrollViewContainer from "components/container/ScrollViewContainer";
import ButtonForm from "components/form/ButtonForm";
import DropdownForm from "components/form/DropdownForm";
import IconButtomForm from "components/form/IconButtomForm";
import PageLayout from "components/Layouts/PageLayout";
import MenuComponent from "components/Menus/MenuComponent";
import MenuItem from "components/Menus/MenuItem";
import QrImgCode from "components/Qr/QrImgCode";
import { base64GetRef, getPathRefFile, saveQrGalery } from "helpers/Galery/GaleryHelper";
import { AJAX, URLPIOAPP } from "helpers/http/ajax";
import alertsState from "helpers/states/alertsState";
import globalState from "helpers/states/globalState";
import schemaGenerateQrPersonaConvivio, { schemaGenerateQrPersonaConvivioType } from "helpers/validatesForm/schemaGenerateQrPersonaConvivio";
import ModalizeCreateInvitado from "pages/Convivio/NominaConvivio/CrearQrConvivio/Layouts/ModalizeCreateInvitado";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { Modalize } from "react-native-modalize";
import { Icon, Text, useTheme } from "react-native-paper";
import PersonasConvivioType from "types/convivio/PersonasConvivioType";
import { generateJsonError, ResponseService } from "types/RequestType";
import { AppTheme } from "types/ThemeTypes";
import Share from 'react-native-share' 

export default function CrearQrConvivio() {

    const qrRef = useRef<any>(null);

    const [visibleMenuQr, setVisibleMenuQr] = useState<boolean>(false)

    const modalizeRefCreateInvitado = useRef<Modalize>(null)
        
    const onOpenModalizeCreateInvitado = () => modalizeRefCreateInvitado.current?.open()

    const onCloseModalizeCreateInvitado = () => modalizeRefCreateInvitado.current?.close()

    const { setOpenScreenLoading, setCloseScreenLoading } = globalState()

    const [invitadosConvivio, setInvitadosConvivio] = useState<PersonasConvivioType[]>([])

    const { openVisibleSnackBar } = alertsState()

    const [userQr, setUserQr] = useState('')

    const theme:AppTheme = useTheme() as AppTheme

    const { control, handleSubmit, reset, resetField, formState: { errors, isValid } } = useForm({
        resolver: yupResolver(schemaGenerateQrPersonaConvivio),
        mode: 'all'
    })

    const getAllInvitados = async () : Promise<ResponseService<PersonasConvivioType[]>> => {
        try {
            const result = await AJAX(`${URLPIOAPP}/personas/convivio/list/invitados`)
            return result
        } catch (error) {
            openVisibleSnackBar(`${error}`, 'error')
            return generateJsonError(`${error}`, 'array')
        }
    }

    const renderInvitados = async() => {
        const resultInvitados = await getAllInvitados()
        setInvitadosConvivio(resultInvitados.data as PersonasConvivioType[])
    }

    const handleSubmitQrInvitados = async (data:schemaGenerateQrPersonaConvivioType) => {
        setUserQr(data.persona_convivio)
    } 

    const handleDownloadQrInvitado = async() => {
        try {
            await saveQrGalery(qrRef.current)
            openVisibleSnackBar(`El QR se guardó en tu galería`, 'success')
            setVisibleMenuQr(false)
        } catch (error) {
            openVisibleSnackBar(`${error}`, 'error')
        }
    } 

    const handleShareQrForWhatsApp = async() => {
        // const filePath = await base64GetRef(qrRef.current)
        const filePath = await getPathRefFile(qrRef.current, 'cache')
        // console.log(`file://${filePath}`)
        await Share.open({
            title: `Qr invitacion`,
            url: `file://${filePath}`,
            message: 'Hola, compartimos Qr de invitacion para el convivio Pinulito 2025.',
        })
        setVisibleMenuQr(false)
    }

    const init = async () => {
        setOpenScreenLoading()
        await renderInvitados()
        setCloseScreenLoading()
    }

    useEffect(() => { init() }, [])

    useEffect(() => {
        userQr && openVisibleSnackBar(`Codigo QR generado correctamente`, 'success')
    }, [userQr])

    return (
        <>
            <ModalizeCreateInvitado
                modalizeRef={modalizeRefCreateInvitado}
                onCloseModalizeCreateInvitado={onCloseModalizeCreateInvitado}
                renderInvitados={renderInvitados}
            />

            <PageLayout titleAppBar="Crear QR" goBack={true}>
                <ScrollViewContainer>
                    <FormAdaptiveKeyBoard>
                        <View className="w-full mt-6 gap-3.5">
                            {/* <DropdownForm
                                control={control}
                                name="id_tipo_persona_convivio"
                                label="Tipo Persona"
                            /> */}
                            <View className="w-full flex flex-row">
                                <View className="flex-1">
                                    <DropdownForm
                                        control={control}
                                        name="persona_convivio"
                                        label="Invitado"
                                        errors={errors}
                                        data={
                                            invitadosConvivio.map(el => ({
                                                value: JSON.stringify({
                                                    codigo: el.codigo,
                                                    id_tipo_persona_convivio: el.id_tipo_persona_convivio
                                                }),
                                                label: el?.nombre_persona_convivio ?? ' -- '
                                            }))
                                        }
                                    />
                                </View>
                                <IconButtomForm
                                    icon="plus"
                                    size={25}
                                    onPress={() => onOpenModalizeCreateInvitado()}
                                />
                            </View>
                            <ButtonForm
                                icon="qrcode-plus"
                                label="Generar Qr"
                                disabled={!isValid}
                                onPress={handleSubmit(handleSubmitQrInvitados)}
                            />
                            <View 
                                className="rounded-2xl w-full h-[300] p-5 flex items-center justify-center"
                                style={{ backgroundColor: theme.colors.surfaceVariant }}
                            >
                                {
                                    userQr ?
                                    <View 
                                        // className="bg-white p-2" 
                                        style={{ position: 'relative' }}
                                    >
                                        <MenuComponent
                                            visible={visibleMenuQr}
                                            onDismiss={() => setVisibleMenuQr(false)}
                                            styleContainer={{ position: 'absolute', zIndex: 10, top: -20, right: -20 }}
                                            anchor={
                                                <IconButtomForm 
                                                    size={25}
                                                    icon={'dots-vertical'} 
                                                    onPress={() => setVisibleMenuQr(true)}
                                                />
                                            }
                                        >
                                            <MenuItem title="Descargar" onPress={handleDownloadQrInvitado} leadingIcon={'download'}/>
                                            <MenuItem title="Compartir" onPress={handleShareQrForWhatsApp} leadingIcon={'share'}/>
                                        </MenuComponent>

                                        <QrImgCode 
                                            value={userQr} 
                                            size={200}
                                            quietZone={7}
                                            getRef={(c) => (qrRef.current = c)}
                                        />  
                                    </View> :
                                    <View className="flex justify-center items-center gap-2">
                                        <Icon source={'qrcode'} size={40}/>
                                        <Text style={{ textAlign: 'center' }}>No hay ningun Qr generado.</Text>
                                    </View>
                                }
                            </View>
                        </View>
                    </FormAdaptiveKeyBoard>
                </ScrollViewContainer>
            </PageLayout>
        </>
    )
}