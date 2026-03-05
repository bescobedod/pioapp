import AppBarHome from "components/container/AppBarHome"
import ScrollViewContainer from "components/container/ScrollViewContainer"
import { View, Image } from 'react-native'
import TextInfo from "components/typografy/TextInfo"
import FormAdaptiveKeyBoard from "components/container/FormAdaptiveKeyBoard"
import DropdownForm from "components/form/DropdownForm"
import InputFormHook from "components/form/InputFormHook"
import { useForm } from "react-hook-form"
import ButtonForm from "components/form/ButtonForm"
import { yupResolver } from '@hookform/resolvers/yup'
import schemaNwVisitaFormValidate, { schemaNwVisitaFormValidateType } from "helpers/validatesForm/schemaNwVisitaFormValidate"
import { useEffect, useState } from "react"
import PickerFile from "components/container/PickerFile"
import globalState from "helpers/states/globalState"
import { ResponseService, generateJsonError } from "types/RequestType"
import { AJAX, FormDataGenerate, URLPIOAPP } from "helpers/http/ajax"
import alertsState from "helpers/states/alertsState"
import fotografyState from "helpers/states/fotografyState"
import { Checkbox, RadioButton, Text, useTheme, IconButton, Icon, List } from 'react-native-paper'
import CheckBoxForm from "components/form/CheckBoxForm"
import PickerSmallFile from "components/container/PickerSmallFile"
import PageLayout from "components/Layouts/PageLayout"
import { NavigationService } from "helpers/navigator/navigationScreens"
import ToggleContainerAnimated from "components/Animaciones/ToggleContainerAnimated"
import { RouteProp, useRoute } from "@react-navigation/native"
import CardContent from "components/Cards/CardContent"
import ListItemComponent from "components/List/ListItemComponent"
import ResponseVisitaEmergenciaType from "types/VisitaEmergencia/ResponseVisitaEmergenciaType"
import SkeletonSaveVisitas from "./Layouts/SkeletonSaveVisitas"
import { getTiendas } from "Apis/TiendasModulo/TiendasModuloApi"
import { getTiposVisitas } from "Apis/TipoVisitas/TipoVisitasApi"
import { postCreateVisita } from "Apis/Visitas/VisitasApi"

type RouteParamasVisitas = {
    visitaEmergencia?:ResponseVisitaEmergenciaType|undefined|null
}

export default function SaveVisitas(){

    const [isVisitaEmergencia, setIsVisitaEmergencia] = useState<boolean>(false)
    const route = useRoute<RouteProp<{ params:RouteParamasVisitas }, 'params'>>();
    const visitaEmergencia:ResponseVisitaEmergenciaType|null = route?.params?.visitaEmergencia ?? null
    const { openVisibleSnackBar } = alertsState()
    const { metadatosPicture, clearMetadatosPicture } = fotografyState()
    const [ renderInit, setRenderInit ] = useState<boolean>(false)
    const theme = useTheme()
    const { setOpenScreenLoading, setCloseScreenLoading } = globalState()
    const [ isLodingForm, setIsLoadingForm ] = useState<boolean>(false)
    const [ isSupervision, SetIsSupervision ] = useState<boolean>(false)
    const [ tipoVisitas, setTipoVisitas ] = useState([
        // { label: 'Supervisión', value: 1 },
        // { label: 'Actualización', value: 2 },
    ])
    const [originalTiendas, setOriginalTiendas] = useState<any[]>([])
    const [ tiendas, setTiendas ] = useState<any[]>([
        // { label: 'PLAZA GUADALUPE', value: `00005-00004` },
        // { label: 'AGUACATAN', value: `00007-00005` },
        // { label: 'VILLA LOBOS 1', value: `00034-00067` },
        // { label: 'CERINAL 1', value: `00005-00004` },
        // { label: 'BARBERENA 2', value: `00005-00004` },
        // { label: 'VILLA CANALES 4', value: `00005-00004` },
    ])
    const [isCantidadPersonas , setIsCantidadPersonas] = useState<boolean>(false)
    const [ fotoCantidadPersonas, setFotoCantidadPersonas ] = useState<any>(null)
    // const [valueRadioBtn, setValueRadioBtn] = useState('');
    const { control, handleSubmit, reset, resetField, formState: { errors, isValid } } = useForm({
        resolver: yupResolver(schemaNwVisitaFormValidate(
            isCantidadPersonas ? true : false,
            visitaEmergencia ? true : false
        )),
        mode: 'all',
        shouldUnregister: true
    })

    const orderDataFormVisitas = (dataForm:schemaNwVisitaFormValidateType):object => {
        const objectTienda = dataForm.tienda.split('-')
        const empresa = objectTienda[0] || ''
        const tienda = objectTienda[1] || ''
        const findTienda:any = originalTiendas.find(el => el.codigo_empresa === empresa && el.codigo_tienda === tienda)

        return {
            empresa: empresa,
            tienda: tienda,
            tienda_nombre: findTienda?.nombre_tienda || null,
            tienda_direccion: findTienda?.direccion_tienda || null,
            id_tipo_visita: dataForm.tipo_visita,
            photo_gps_longitude: metadatosPicture?.exif?.GPSLongitude || null,
            photo_gps_latitude: metadatosPicture?.exif?.GPSLatitude || null,
            phone_gps_longitude: metadatosPicture?.coords?.longitude || null,
            phone_gps_latitude: metadatosPicture?.coords?.latitude || null,
            name_original_image: metadatosPicture?.nameImg || null,
            comentario: dataForm?.comentario ?? "",
            foto_visita: { 
                uri: metadatosPicture.imgUri,
                type: metadatosPicture.mimeType,
                name: metadatosPicture.nameImg
            },
            uso_uniforme: dataForm?.uniforme || false,
            buzon_cerrado: dataForm?.buzon || false,
            tienda_limpia: dataForm?.tienda_limpia || false,
            cantidad_personas: dataForm?.personas || false,
            cantidad: dataForm?.cantidad_personas || 0,
            name_original_photo_personas: fotoCantidadPersonas?.uri?.split('/').pop() || null,
            foto_personas: fotoCantidadPersonas ? {
                uri: fotoCantidadPersonas?.uri || '',
                type: fotoCantidadPersonas?.mimeType || '',
                name: fotoCantidadPersonas?.uri?.split('/').pop() || null
            } : null,
            ...(visitaEmergencia ? { id_visita_emergencia: visitaEmergencia.id_visita } : {})
        }
    }

    const clearFormVisitas = () => {
        setIsCantidadPersonas(false)
        SetIsSupervision(false)
        reset()
        clearMetadatosPicture()
    }

    const submitFormNwVisita = async(data: schemaNwVisitaFormValidateType) => {
        // console.log(fotoCantidadPersonas)

        const { imgUri, coords, mimeType, nameImg } = metadatosPicture

        if(!imgUri) return openVisibleSnackBar('Porfavor agrege una imagen.', "warning")

        if(!coords || !mimeType || !nameImg) return openVisibleSnackBar('Error en la imagen porfavor intentelo de nuevo.', "warning")

        if(!fotoCantidadPersonas && isCantidadPersonas) return openVisibleSnackBar("Porfavor agrege una imagen para cantidad de personas.", "warning")

        const uploadData = orderDataFormVisitas(data)

        setIsLoadingForm(true)

        const resultCreateVisita = await postCreateVisita(uploadData)

        resultCreateVisita.status && clearFormVisitas()

        //DEPRECAR (SOLO ES PARA DEMO)
        // openVisibleSnackBar('Visitada creada correctamente.', 'success')
        // clearFormVisitas()
        //DEPRECAR (SOLO ES PARA DEMO)

        setIsLoadingForm(false)

        resultCreateVisita.status && NavigationService.reset('Home')
        //DEPRECAR (SOLO ES PARA DEMO)
        // NavigationService.reset('Home')
        //DEPRECAR (SOLO ES PARA DEMO)
    }

    const renderAll = async () => {
        // setOpenScreenLoading()
        setRenderInit(true)
        const listTiendas = await getTiendas()
        const listTipoVisita = await getTiposVisitas()
        const flatTiendas:any = listTiendas.data?.flatMap(el => ({ label: el.nombre_tienda, value: `${el.codigo_empresa}-${el.codigo_tienda}` }))
        const flatTipoVisitas:any = listTipoVisita.data?.flatMap(el => ({ label: el.name, value: el.id_tipo_visita }))
        setOriginalTiendas(listTiendas?.data ?? [])
        setTiendas(flatTiendas)
        setTipoVisitas(flatTipoVisitas)
        // setCloseScreenLoading()
        setRenderInit(false)
    }

    const validateIsSupervicion = (item:any) => {
        const validSupervision = (item?.value || 0) == 1
        setIsCantidadPersonas(false)
        resetField('uniforme', { defaultValue: false })
        resetField('buzon', { defaultValue: false })
        resetField('tienda_limpia', { defaultValue: false })
        resetField('personas', { defaultValue: false })
        SetIsSupervision(validSupervision ? true : false)
    }

    //funciones para visitas emergencia o visitas programadas
    const validateIsVisitaEmergencia = () => {
        if(!visitaEmergencia) return
        //para seleccionar una tienda el valor es {empresa}-{tienda}
        resetField('tienda', { defaultValue: `${visitaEmergencia.empresa}-${visitaEmergencia.tienda}` })
        resetField('tipo_visita', { defaultValue: 5 })
        setIsVisitaEmergencia(true)
    }
    //funciones para visitas emergencia o visitas programadas

    const onChangeCheckBoxPersonas = (value:boolean) => {
        setIsCantidadPersonas(value)
        !value && resetField('cantidad_personas', { defaultValue: '' })
        !value && setFotoCantidadPersonas(null)
    }

    const init = async() => {
        clearMetadatosPicture()
        await renderAll() 
        validateIsVisitaEmergencia()
    }

    //descomentar para hacer funcionar
    useEffect(() => { init() }, [])

    return (

        <>
            <PageLayout 
                titleAppBar="Visitas" 
                goBack={visitaEmergencia ? true : false}
                notification={visitaEmergencia ? false : true}
            >

                <ScrollViewContainer>

                    {/* <View className="w-full mt-6">
                        <TextInfo style={{ textAlign: "justify" }}>Fomulario para ingreso de una nueva visita a una tienda porfavor completa los campos solicitados de manera correcta.</TextInfo>
                    </View> */}
                    
                    { renderInit && <SkeletonSaveVisitas styleContent={{ position: 'absolute', zIndex: 1 }}/> } 

                    <FormAdaptiveKeyBoard>

                        <View className="w-full flex-col gap-3.5 mt-5 mb-5">

                            {/* Visita emergencia */}
                            <ToggleContainerAnimated className="w-full" visible={isVisitaEmergencia}>
                                <CardContent className="w-full">
                                    <ListItemComponent
                                        iconLeft={'calendar'}
                                        title={"Fecha programacion"}
                                        description={visitaEmergencia?.fecha_programacion ?? ' -- '}
                                    />
                                    <ListItemComponent
                                        iconLeft={'comment-text-outline'}
                                        title={"Comentario"}
                                        description={visitaEmergencia?.comentario ?? ' -- '}
                                        descriptionNumberOfLines={0}
                                    />
                                </CardContent>
                            </ToggleContainerAnimated>

                            <DropdownForm
                                label="Tienda"
                                data={tiendas}
                                control={control}
                                name="tienda"
                                errors={errors}
                                disable={isLodingForm || isVisitaEmergencia}
                            />

                            <DropdownForm
                                label="Tipo Visita"
                                data={visitaEmergencia ? tipoVisitas : tipoVisitas.filter(({ value }) => value != 5 )}
                                control={control}
                                name="tipo_visita"
                                errors={errors}
                                disable={isLodingForm || isVisitaEmergencia}
                                onChangeExtra={(item) => validateIsSupervicion(item)}
                            />

                            {/* Picker photo */}
                            <PickerFile disabled={isLodingForm}/>

                            {/* CHECKBOX */}
                            <ToggleContainerAnimated className="w-full" visible={isSupervision}>
                                {/* <Text style={{ textAlign:"right", paddingRight: 15 }} variant="bodySmall">si/no</Text> */}
                                <CheckBoxForm 
                                    control={control}
                                    name="uniforme"
                                    label="Uso de uniforme"
                                    disabled={isLodingForm}
                                />
                                <CheckBoxForm 
                                    control={control}
                                    name="buzon"
                                    label="Buzón cerrado"
                                    disabled={isLodingForm}
                                />
                                <CheckBoxForm 
                                    control={control}
                                    name="tienda_limpia"
                                    label="Tienda limpia"
                                    disabled={isLodingForm}
                                />
                                <CheckBoxForm
                                    control={control}
                                    name="personas"
                                    label="Cantidad Personas"
                                    disabled={isLodingForm}
                                    onChangeExtra={ (value) => onChangeCheckBoxPersonas(value) }
                                />
                            </ToggleContainerAnimated>

                            {/* FORMULARIO CANTIDAD PERSONAS */}
                            <ToggleContainerAnimated className="flex flex-col gap-3.5" visible={isCantidadPersonas}>
                                <InputFormHook
                                    control={control}
                                    name="cantidad_personas"
                                    errors={errors}
                                    label="Cantidad"
                                    maxLength={2}
                                    placeholder="Ingrese una cantidad"
                                    inputType="numeric"
                                    disabled={isLodingForm}
                                />
                                {/* Picker */}
                                <PickerSmallFile 
                                    disabled={isLodingForm}
                                    onSelectFile={ (file) => setFotoCantidadPersonas(file) }    
                                />
                            </ToggleContainerAnimated>

                            <InputFormHook 
                                control={control} 
                                maxLength={500}
                                name="comentario" 
                                placeholder="Ingrese un comentario" 
                                label="Comentario"
                                errors={errors}
                                disabled={isLodingForm}
                                multiline={true}
                            />

                            <View className="w-full mt-3 mb-10">
                                <ButtonForm 
                                    icon="content-save"
                                    loading={isLodingForm} 
                                    disabled={isLodingForm||(!isValid)}
                                    onPress={handleSubmit(submitFormNwVisita)} 
                                    label="Guardar"
                                    buttonColor={theme.colors.error}
                                    // style={{ backgroundColor: theme.colors.error }}
                                />
                            </View>

                        </View>

                    </FormAdaptiveKeyBoard>                

                </ScrollViewContainer>

            </PageLayout>
        </>

    )

}