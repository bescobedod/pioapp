import { yupResolver } from "@hookform/resolvers/yup";
import { DetalleEntradaInventario, EntradaInventarioType, getArticulosDevolucion, getRecepcionesValidDay } from "Apis/ArticulosRecepcion/ArticulosRecepcionApi";
import { getTiendas } from "Apis/TiendasModulo/TiendasModuloApi";
import FormAdaptiveKeyBoard from "components/container/FormAdaptiveKeyBoard";
import PickerFile from "components/container/PickerFile";
import ScrollViewContainer from "components/container/ScrollViewContainer";
import ButtonForm from "components/form/ButtonForm";
import DropdownForm from "components/form/DropdownForm";
import IconButtomForm from "components/form/IconButtomForm";
import PageLayout from "components/Layouts/PageLayout";
import ListItemComponent from "components/List/ListItemComponent";
import ListRender from "components/List/ListRender";
import DataTableInfo from "components/tables/DataTableInfo";
import PickerVideo from "components/VideoPicker/PickerVideo";
import { onOpenModalize } from "helpers/Modalize/ModalizeHelper";
import alertsState from "helpers/states/alertsState";
import fotografyState from "helpers/states/fotografyState";
import globalState from "helpers/states/globalState";
import videografyState from "helpers/states/videografyState";
import schemaFormNwDevoluciones, { schemaFormNwDevolucionesType } from "helpers/validatesForm/schemaFormNwDevoluciones";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Animated, StyleSheet, View } from "react-native";
import { Modalize } from "react-native-modalize";
import { ActivityIndicator, Icon, Text, useTheme } from "react-native-paper";
import Option from "types/Dropdown/Option";
import { AppTheme } from "types/ThemeTypes";
import ModalizeDevolucionArticulo from "./Layout/ModalizeDevolucionArticulo";
import { postCreateDevolucion } from "Apis/Devolucion/DevolucionApi";
import { NavigationService } from "helpers/navigator/navigationScreens";

export type TableDataArticulosDevolucion = (DetalleEntradaInventario&{cantidadDevolver:number})

export default function DevolucionCreacionPage() {
    const theme = useTheme() as AppTheme
    const { control, handleSubmit, reset, resetField, formState: { errors, isValid }, watch } = useForm({
        resolver: yupResolver(schemaFormNwDevoluciones),
        mode: 'all',
        shouldUnregister: true
    })
    const { metadatosPicture, clearMetadatosPicture } = fotografyState()
    const { metadatosVideo, clearMetadatosVideo } = videografyState()
    const { setOpenScreenLoading, setCloseScreenLoading } = globalState()
    const [tiendasState, setTiendasState] = useState<Option[]>([])
    const [initLoadingPage, setInitLoadingPage] = useState<boolean>(true)
    const opacity = useRef(new Animated.Value(1)).current
    const [recepciones, setRecepciones] = useState<EntradaInventarioType[]>([])
    const [loadingRecepciones, setLoadingRecepciones] = useState<boolean>(false)
    const [articulosDevolucion, setArticulosDevolucion] = useState<TableDataArticulosDevolucion[]>([])
    const { openVisibleSnackBar } = alertsState()
    const valueTienda = watch('tienda')
    const valueRecepcion = watch('recepcion')
    const modalizeRefDevolucionArticulo = useRef<Modalize>(null)
    const [selectArticuloDevolucion, setSelectArticuloDevolucion] = useState<TableDataArticulosDevolucion|null>(null)
    const [loadingFormDevolucion, setLoadingFormDevolucion] = useState<boolean>(false)

    const clearHook = () => {
        clearMetadatosPicture()
        clearMetadatosVideo()
    }

    const renderTiendas = async() => {
        const listTiendas = await getTiendas()
        const flatTiendas:any = listTiendas.data?.flatMap(el => ({ label: el.nombre_tienda, value: `${el.codigo_empresa}-${el.codigo_tienda}` }))
        setTiendasState(flatTiendas)
        setInitLoadingPage(false)
    }

    const onFocusDropdownRecepciones = async() => {
        try {
            setLoadingRecepciones(true)
            const [empresa, tienda] = valueTienda.split('-')
            const result = await getRecepcionesValidDay({ empresa, tienda })
            setRecepciones(result?.data ?? [])   
        } catch (error) {
            openVisibleSnackBar(`${error}`, 'error')
        }finally {
            setLoadingRecepciones(false)
        }
    }

    const onChangeValueRecepcionSeleccionada = async () => {
        if(!valueRecepcion) return
        try {
            setOpenScreenLoading()
            const recepcionSelect = recepciones?.find(el => el.idEntradaInventario == Number(valueRecepcion)) ?? null
            const result = await getArticulosDevolucion({
                codigoPOS: `${recepcionSelect?.empresa}-${recepcionSelect?.tienda}`,
                numero: Number(recepcionSelect?.idEntradaInventario),
                serie: recepcionSelect?.serie ?? ''
            })
            // console.log(result)
            const resultMapRecepciones = result.map(el => ({ ...el, cantidadDevolver: 0 })) 
            setArticulosDevolucion(resultMapRecepciones ?? [])    
        } catch (error) {
            openVisibleSnackBar(`${error}`, 'error')
        }finally {
            setCloseScreenLoading()
        }
        
    }

    const editCantidadDevolverState = (cantidadDevolver:number) => {
        if (!selectArticuloDevolucion) return
        setArticulosDevolucion(prev =>
            prev.map(item =>
                item.ItemCode === selectArticuloDevolucion.ItemCode
                    ? { ...item, cantidadDevolver }
                    : item
            )
        )
        setSelectArticuloDevolucion(prev =>
            prev ? { ...prev, cantidadDevolver } : prev
        )
    }

    const onSubmitFormSaveDevolucion = async(data:schemaFormNwDevolucionesType) => {
        try {
            const { imgUri, mimeType:mimeTypeImage, nameImg } = metadatosPicture
            const { videoUri, mimeType:mimeTypeVideo, fileName } = metadatosVideo
            if(!imgUri || !mimeTypeImage || !nameImg) return openVisibleSnackBar(`Porfavor ingresa un imagen de la temperatura.`, 'warning')  
            if(!videoUri || !mimeTypeVideo || !fileName) return openVisibleSnackBar(`Porfavor ingresa un video de comprobante.`, 'warning')
            const [empresa, tienda] = data.tienda.split('-')
            const articulosDevolucionValid = articulosDevolucion.filter(el => Number(el?.cantidadDevolver ?? 0) > 0)
            const bodyFormData = {
                empresa,
                tienda,
                idEntradaInventario: data.recepcion,
                detalle_devolucion: JSON.stringify(articulosDevolucionValid),
                foto_temperatura: { 
                    uri: imgUri,
                    type: mimeTypeImage,
                    name: nameImg
                },
                video_comprobante: { 
                    uri: videoUri,
                    type: mimeTypeVideo,
                    name: fileName
                },
            }
            setLoadingFormDevolucion(true)
            const result = await postCreateDevolucion(bodyFormData)
            if(result.status) {
                openVisibleSnackBar(`${result?.message ?? 'Devolucion creada correctamente.'}`, 'success')
                NavigationService.reset('Home')
            }
        } catch (error) {
            openVisibleSnackBar(`${error}`, 'error')    
        } finally {
            setLoadingFormDevolucion(false)
        }
    }

    useEffect(() => { 
        clearHook() 
        return clearHook()
    }, [])

    useEffect(() => { renderTiendas() }, [])

    useEffect(() => {
        if (!initLoadingPage) {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start()
        }
    }, [initLoadingPage])

    useEffect(() => {
        resetField('recepcion', { defaultValue: '' })
        setRecepciones([])
        setArticulosDevolucion([])
    }, [valueTienda])

    useEffect(() => {
        onChangeValueRecepcionSeleccionada()
    }, [valueRecepcion])

    return (
        <>
            {/* loading */}
            <Animated.View
                pointerEvents={initLoadingPage ? 'auto' : 'none'}
                style={[{
                    backgroundColor: theme.colors.background,
                    opacity,
                }, stylesDevolucionCreate.screenLoading]}
            >
                <ActivityIndicator
                    animating={true}
                    size={'large'}
                    color={theme.colors.primary}
                />
            </Animated.View>

            {/* modalize para editar articulo devolucion */}
            <ModalizeDevolucionArticulo
                modalizeRefDevolucionArticulo={modalizeRefDevolucionArticulo}
                selectArticuloDevolucion={selectArticuloDevolucion}
                editCantidadDevolverState={editCantidadDevolverState}
            />

            <PageLayout 
                goBack 
                notification={false}
                titleAppBar="Nueva devolucion"
            >
                <ScrollViewContainer>
                    <View className="w-full my-6">
                        <FormAdaptiveKeyBoard>
                            <View className="w-full flex-col gap-3.5">
                                <DropdownForm
                                    label="Tienda"
                                    data={tiendasState}
                                    control={control}
                                    name="tienda"
                                    errors={errors}
                                    disable={loadingFormDevolucion}
                                />
                                <DropdownForm
                                    loading={loadingRecepciones}
                                    label="Recepciones"
                                    onFocus={onFocusDropdownRecepciones}
                                    data={recepciones.map(el => ({
                                        label: `${el.title_resumen}`,
                                        value: el.idEntradaInventario
                                    }))}
                                    control={control}
                                    name="recepcion"
                                    errors={errors}
                                    disable={!valueTienda || loadingFormDevolucion}
                                />

                                {/* Productos para dar de baja */}
                                <ListItemComponent
                                    titleStyle={{ color: theme.colors.primary }}
                                    title="PRODUCTOS DE BAJA"
                                    description="Ingresa las cantidades que quieres dar de baja."
                                    descriptionNumberOfLines={0}
                                />
                                <DataTableInfo
                                    data={articulosDevolucion}
                                    configTable={[
                                        {
                                            data: null,
                                            name: 'Producto',
                                            render: (data:TableDataArticulosDevolucion) => (
                                                <View className="w-full flex flex-col items-start">
                                                    <Text numberOfLines={0}>
                                                        {data.nombreProducto}
                                                    </Text>
                                                </View>
                                            ) 
                                        },
                                        {
                                            numericHeader: true,
                                            numeric: true,
                                            data: 'cantidadReal',
                                            name: 'cantidad'
                                        },
                                        {
                                            numeric: true,
                                            numericHeader: true,
                                            data: null,
                                            name: 'Devolver',
                                            render: (data:TableDataArticulosDevolucion) => {
                                                const cantidadDevolver = Number(data?.cantidadDevolver ?? 0)
                                                return (
                                                    <View className="flex-row gap-1 items-center">
                                                        <Text style={{ ...(cantidadDevolver > 0 ? { color: theme.colors.error } : {}) }}>
                                                            {cantidadDevolver > 0 ? `-${cantidadDevolver}` : cantidadDevolver}
                                                        </Text>
                                                        <IconButtomForm
                                                            icon="pencil"
                                                            disabled={loadingFormDevolucion}
                                                            // loading={loadingFormDevolucion}
                                                            onPress={() => {
                                                                setSelectArticuloDevolucion({...data})
                                                                onOpenModalize(modalizeRefDevolucionArticulo)
                                                            }}
                                                        />
                                                    </View>
                                                )
                                            }
                                        }
                                    ]}
                                />

                                <ListItemComponent
                                    titleStyle={{ color: theme.colors.primary }}
                                    title="FOTOGRAFIA TEMPERATURA"
                                    description="Porfavor toma una fotografia clara de la temperatura."
                                    descriptionNumberOfLines={0}
                                />
                                <PickerFile location={false} disabled={loadingFormDevolucion}/>
                                <ListItemComponent
                                    titleStyle={{ color: theme.colors.primary }}
                                    title="VIDEO COMPROBANTE"
                                    description="Porfavor captura un video de comprobante de baja y que cumpla los siguientes requisitos:"
                                    descriptionNumberOfLines={0}
                                />
                                <ListRender
                                    titleSubheader={''}
                                    items={[
                                        {
                                            title: 'Indicar tienda',
                                            left(props) {
                                                return (<Icon source="circle-small" size={20}/>)
                                            },
                                        },
                                        {
                                            title: 'Fecha de reclamo',
                                            left(props) {
                                                return (<Icon source="circle-small" size={20}/>)
                                            },
                                        },
                                        {
                                            title: 'Color de cinta',
                                            left(props) {
                                                return (<Icon source="circle-small" size={20}/>)
                                            },
                                        },
                                        {
                                            title: 'Motivo',
                                            left(props) {
                                                return (<Icon source="circle-small" size={20}/>)
                                            },
                                        },
                                        {
                                            title: 'Video claro',
                                            left(props) {
                                                return (<Icon source="circle-small" size={20}/>)
                                            },
                                        },
                                        {
                                            title: 'Pesas en buen estado',
                                            left(props) {
                                                return (<Icon source="circle-small" size={20}/>)
                                            },
                                        },
                                    ]}
                                />
                                <PickerVideo location={false} disabled={loadingFormDevolucion}/>
                                <ButtonForm 
                                    className="mt-3 mb-5"
                                    label="Guardar" 
                                    icon="content-save"
                                    buttonColor={theme.colors.error}
                                    onPress={handleSubmit(onSubmitFormSaveDevolucion)}
                                    disabled={!isValid || loadingFormDevolucion}
                                    loading={loadingFormDevolucion}
                                />
                            </View>
                        </FormAdaptiveKeyBoard>
                    </View>
                </ScrollViewContainer>
            </PageLayout>
        </>
    )
}

const stylesDevolucionCreate = StyleSheet.create({
    screenLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
    }
})