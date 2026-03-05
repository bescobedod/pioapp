import ScrollViewContainer from "components/container/ScrollViewContainer"
import { ScrollView, View } from "react-native"
import DataTableInfo from "components/tables/DataTableInfo"
import configTableRutas from "helpers/tables/configTableRutas"
import { useEffect, useRef, useState } from "react"
import PageLayout from "components/Layouts/PageLayout"
import DatePickerForm from "components/form/DatePickerForm"
import FormAdaptiveKeyBoard from "components/container/FormAdaptiveKeyBoard"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import schemaListRutasForm from "helpers/validatesForm/schemaListRutasForm"
import DropdownForm from "components/form/DropdownForm"
import { formatDate, formatDateEsShort } from "helpers/fechas/fechasHelper"
import { generateJsonError, ResponseService } from "types/RequestType"
import RutasListType from "types/Rutas/RutasListType"
import QueryParamsRutasType from "types/Rutas/QueryParamsRutasType"
import { AJAX, URLPIOAPP } from "helpers/http/ajax"
import alertsState from "helpers/states/alertsState"
import globalState from "helpers/states/globalState"
import TiendasRuta from "types/Rutas/TiendasRuta"
import Option from "types/Dropdown/Option"
import FabFloating from "components/container/FabFloating"
import { handleScroll } from "helpers/Scroll/ScrollHelper"
import { Modalize } from "react-native-modalize"
import ModalizeDetalleArticulosLayout from "pages/Layouts/Rutas/ModalizeDetalleArticulosLayout"
import detalleArticulosState from "helpers/states/detalleArticulosState"
import { AppTheme } from "types/ThemeTypes"
import { useTheme } from "react-native-paper"
import ChipDecoration from "components/decoration/ChipDecoration"
import ToggleContainerAnimated from "components/Animaciones/ToggleContainerAnimated"
import rutasState from "helpers/states/rutasState"
import ModalizeMapViewLayout from "pages/Layouts/Rutas/ModalizeMapViewLayout"
import { onOpenModalize } from "helpers/Modalize/ModalizeHelper"
import { getLocation, getUbicacionActual } from "helpers/ubicacion/ubicacionHelper"
import { getTiendaByCodigo, TiendaModuloType } from "Apis/TiendasModulo/TiendasModuloApi"
import { LatLng } from "react-native-maps"
import ModalizeDetalleRecepcionLayout from "pages/Layouts/Rutas/ModalizeDetalleRecepcionLayout"
import { getRutas, getTiendasFilter } from "Apis/RutasView/RutasViewApi"

export default function Rutas() {

    const theme:AppTheme = useTheme() as AppTheme
    const { openVisibleSnackBar } = alertsState()
    const { setOpenScreenLoading, setCloseScreenLoading } = globalState()
    const [queryParamsRutas, setQueryParamsRutas] = useState<QueryParamsRutasType>({
        fecha_entrega: '',
        empresa: '',
        tienda: ''
    })
    // const [rutas, setRutas] = useState<RutasListType[]>([])
    const { rutas, setRutas } = rutasState()
    const [optionsTiendasRuta, setOptionsTiendaRuta] = useState<Option[]>([])
    const [loadingTiendasRuta, setLoadingTiendasRuta] = useState<boolean>(false)
    const [visibleFab, setVisibleFab] = useState<boolean>(true); 
    const [reloadRutas, setReloadRutas] = useState<boolean>(false)
    const offsetY = useRef(0);
    const modalizeRefDetalleArticulos = useRef<Modalize>(null)
    const modalizeRefMapView = useRef<Modalize>(null)
    //referencia para modalize de detalle recepcion
    const modalizeRefDetalleRecepcion = useRef<Modalize>(null)
    const scrollChipRef = useRef<ScrollView>(null)
    // const onCloseModalizeDetalleArticulos = () => modalizeRefDetalleArticulos.current?.close()
    const { setRutaDetalle } = detalleArticulosState()
    const { control, handleSubmit, reset, resetField, formState: { errors }, watch } = useForm({
            resolver: yupResolver(schemaListRutasForm),
            mode: 'all'
    })
    const valueDateFilterRuta = watch('date')
    const valueUbicacionesRuta = watch('ubicaciones')
    //variables para ruta navegacion
    const [rutaNav, setRutaNav] = useState<TiendaModuloType>()
    const [location, setLocation] = useState<LatLng>()

    const onOpenModalizeDetalleArticulos = () => modalizeRefDetalleArticulos.current?.open()

    const stateHandleSetRutas = async() => {
        const result = await getRutas(queryParamsRutas)
        //recepcion... 1 es ya recepcionada y 0 no recepcionada
        // console.log(result)
        setRutas(result.data as RutasListType[])
    }

    const renderRutas = async() => {
        if(!queryParamsRutas.fecha_entrega) return
        setOpenScreenLoading()

        await stateHandleSetRutas()
        
        setCloseScreenLoading()
    }

    const onFocusDropdownTiendas = async() => {
        if(!queryParamsRutas.fecha_entrega) return
        setLoadingTiendasRuta(true)
        const result = await getTiendasFilter(queryParamsRutas)
        const dataMapOptions:Option[] = result.data?.flatMap(el => ({ value: `${el.empresa}-${el.tienda}`, label: `${el.tienda_nombre}` })) as Option[]
        setOptionsTiendaRuta(dataMapOptions)
        setLoadingTiendasRuta(false)
    }

    const cleanDataRuta = () => {
        reset()
        setRutas([])
        setOptionsTiendaRuta([])
        setQueryParamsRutas({ fecha_entrega: '', empresa: '', tienda: '' })
    }

    const getNameTiendaByCode = (codTienda:string) : string => {
        const result = optionsTiendasRuta?.find(({ value })=> value === codTienda) ?? null
        return result?.label ?? ' -- '
    }

    const onPressBtnWaze = async(ruta:RutasListType) => {
        try {
            setOpenScreenLoading()
            const ubicacionActual = await getUbicacionActual()
            if(!ubicacionActual) throw new Error(`Ooops ocurrio un error al obtener la Ubicacion porfavor verifice permisos y que la ubicacion este activa.`); 
            const result = await getTiendaByCodigo({ codigo_empresa: ruta.empresa, codigo_tienda: ruta.tienda }, false) 
            if(!result.status) throw new Error(`${result.message}`)
            if(!result.data?.latitud || !result.data?.altitud) throw new Error(`Oooops. direccion de la tienda no disponible.`);
            //setear estados para pasar a modalize navegacion
            setRutaNav(result.data)
            setLocation(ubicacionActual)
            //setear estados para pasar a modalize navegacion
            onOpenModalize(modalizeRefMapView)   
        } catch (error) {
            openVisibleSnackBar(`${error}`, 'error')
        } finally {
            setCloseScreenLoading()
        }
    }

    //funciones para modalize 
    const onPressRecepcion = () => {
        onOpenModalize(modalizeRefDetalleRecepcion)
    }

    useEffect(() => {
        const fecha_entrega = valueDateFilterRuta ? formatDate(new Date(valueDateFilterRuta)) : null
        const arrayValueTienda:string[] = valueUbicacionesRuta?.split('-') || []
        const empresa:string = arrayValueTienda[0] || ''
        const tienda:string = arrayValueTienda[1] || ''
        setQueryParamsRutas({fecha_entrega, empresa, tienda})
        //resetear scroll horizontal de los chip
        scrollChipRef.current?.scrollTo({ x: 0, animated: true })
    }, [valueDateFilterRuta, valueUbicacionesRuta])

    useEffect(() => {
        renderRutas()
    }, [queryParamsRutas])

    useEffect(() => { 
        setRutas([])
    }, [])

    return (
        <>
            <ModalizeMapViewLayout
                modalizeRef={modalizeRefMapView}
                rutaNav={rutaNav}
                location={location}
            />
            <ModalizeDetalleArticulosLayout
                modalizeRef={modalizeRefDetalleArticulos}
            />
            <ModalizeDetalleRecepcionLayout
                modalizeRefDetalleRecepcion={modalizeRefDetalleRecepcion}
            />

            {/* <FabFloating 
                onPress={handlePressFabFilter} 
                disabled={
                    (valueDateFilterRuta || valueUbicacionesRuta) ? false : true
                } 
                icon="filter-remove" 
                // label="Limpiar Filtros" 
                visible={visibleFab}
            /> */}

            <PageLayout titleAppBar="Rutas">

                <ScrollViewContainer onScroll={(e) => handleScroll(e, offsetY, visibleFab, setVisibleFab)}>
                    <FormAdaptiveKeyBoard>
                        <View className="w-full flex-col gap-3.5 my-5">

                            {/* Chip de filtros */}
                            <ScrollView
                                ref={scrollChipRef}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                // contentContainerStyle={{ paddingRight: 12 }}
                            >
                                {
                                    (valueDateFilterRuta || valueUbicacionesRuta) && (
                                        <View className="w-full flex flex-row gap-3 py-2.5">
                                            <ToggleContainerAnimated visible={valueDateFilterRuta ? true : false}>
                                                <ChipDecoration 
                                                    onPress={() => {}}  
                                                    title={`${valueDateFilterRuta ? formatDateEsShort(valueDateFilterRuta) : ' -- '}`} 
                                                    icon="calendar"
                                                    closeIcon="close"
                                                    onClose={() => cleanDataRuta() }
                                                />
                                            </ToggleContainerAnimated>
                                            <ToggleContainerAnimated visible={valueUbicacionesRuta ? true : false}>
                                                <ChipDecoration 
                                                    onPress={() => {}} 
                                                    title={`${getNameTiendaByCode(valueUbicacionesRuta ?? '')}`} 
                                                    icon="store"
                                                    closeIcon="close"
                                                    onClose={() => resetField('ubicaciones', { defaultValue: '' })}
                                                />
                                            </ToggleContainerAnimated>
                                        </View>
                                    )
                                }
                            </ScrollView>

                            <DatePickerForm 
                                control={control} 
                                name="date"
                                errors={errors}
                            />
                            <DropdownForm 
                                control={control} 
                                name="ubicaciones"
                                label="Ubicaciones"
                                onFocus={onFocusDropdownTiendas}
                                data={optionsTiendasRuta}
                                loading={loadingTiendasRuta}
                                disable={!(valueDateFilterRuta)}
                            />
                            <DataTableInfo
                                search={false}
                                filter={false}
                                pagination={true}
                                configTable={configTableRutas(
                                    theme,
                                    // reloadRutasController,
                                    // reloadRutas
                                    onPressBtnWaze,
                                    onPressRecepcion
                                )}
                                data={rutas}
                                groupField="tienda_nombre"
                                onPressRow={(data:RutasListType) => {
                                    // setRutaDetalle({...data})
                                    setRutaDetalle(data)
                                    onOpenModalizeDetalleArticulos()
                                }}
                            />
                        </View>
                    </FormAdaptiveKeyBoard>
                </ScrollViewContainer>
            </PageLayout>
        </>
    )
}