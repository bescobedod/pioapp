import CardContent from "components/Cards/CardContent";
import CardTitle from "components/Cards/CardTitle";
import ScrollViewContainer from "components/container/ScrollViewContainer";
import IconButtomForm from "components/form/IconButtomForm";
import PageLayout from "components/Layouts/PageLayout";
import ListItemComponent from "components/List/ListItemComponent";
import DataTableInfo from "components/tables/DataTableInfo";
import { AJAX, URLPIOAPP } from "helpers/http/ajax";
import { NavigationService } from "helpers/navigator/navigationScreens";
import alertsState from "helpers/states/alertsState";
import globalState from "helpers/states/globalState";
import scannerQrState from "helpers/states/scannerQrState";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";
import ResponseConsumoPersonaType from "types/convivio/ResponseConsumoPersonaType";
import { ResponseGetPersonaQrType } from "types/convivio/ResponseGetPersonaQrType";
import ValueQrPersonasType from "types/convivio/ValueQrPersonasType";
import MethodRequestType from "types/Request/MethodRequestType";
import { generateJsonError, ResponseService } from "types/RequestType";
import { AppTheme } from "types/ThemeTypes";

export default function NominaConvivio() {

    const theme:AppTheme = useTheme() as AppTheme

    const [personaQr, setPersonaQr] = useState<ResponseGetPersonaQrType|null>(null)

    const [consumoPersona, setConsumoPersona] = useState<ResponseConsumoPersonaType[]>([]);

    const [valueQr, setValueQr] = useState<ValueQrPersonasType|null>(null)

    const { valueScannedQr, clearValueScannedQr } = scannerQrState()

    const { setOpenScreenLoading, setCloseScreenLoading } = globalState()

    const { openVisibleSnackBar } = alertsState()

    const { control, handleSubmit, reset, resetField, formState: { errors, isValid } } = useForm({
        resolver: undefined,
        mode: 'all'
    })

    const getPersonaQr = async () : Promise<ResponseService<ResponseGetPersonaQrType>> => {
        try {
            const result = await AJAX(`${URLPIOAPP}/personas/convivio/scanner/qr?codigo=${valueQr?.codigo ?? ''}&id_tipo_persona_convivio=${valueQr?.id_tipo_persona_convivio ?? ''}`, 'GET')
            return result
        } catch (error) {
            openVisibleSnackBar(`${error}`, 'error')
            return generateJsonError(`${error}`, 'object')
        }
    }

    const getConsumoPersona = async(id_personas_convivio:number) : Promise<ResponseService<ResponseConsumoPersonaType[]>> => {
        try {
            const result = await AJAX(`${URLPIOAPP}/consumos/convivio/list?id_personas_convivio=${id_personas_convivio}`)
            return result
        } catch (error) {
            openVisibleSnackBar(`${error}`, 'error')
            return generateJsonError(`${error}`, 'array')
        }
    }

    const postAddConsumo = async (data:ResponseConsumoPersonaType, method:MethodRequestType) : Promise<ResponseService<any>> => {
        try {
            const result = await AJAX(`${URLPIOAPP}/consumos/convivio/create`, method, data)
            return result
        } catch (error) {
            openVisibleSnackBar(`${error}`, 'error')
            return generateJsonError(`${error}`, 'object')
        }
    }

    const handleValueScannerQr = () => {
        if(!(valueScannedQr?.data || null)) return
        const jsonValueQrConvivio:ValueQrPersonasType = JSON.parse(valueScannedQr.data)
        setValueQr({...jsonValueQrConvivio})
        clearValueScannedQr()
    }

    const handleChargeQrScanner = async () => {
        if(!valueQr) return

        setOpenScreenLoading()
        const resultGetPersonaQr = await getPersonaQr()
        const resultConsumoPersona =
            resultGetPersonaQr.status ?
                await getConsumoPersona(resultGetPersonaQr.data?.id_personas_convivio ?? 0) :
                generateJsonError(``, 'array')
        
        setPersonaQr(resultGetPersonaQr.data as ResponseGetPersonaQrType)
        setConsumoPersona(resultConsumoPersona.data as ResponseConsumoPersonaType[])
        setCloseScreenLoading()
    }

    const handleOnpressAddConsumo = async (data:ResponseConsumoPersonaType, method:MethodRequestType) => {
        setOpenScreenLoading()
        const resultAddConsumo = await postAddConsumo(data, method)
        if(resultAddConsumo.status) {
            const resultConsumoPersona = await getConsumoPersona(personaQr?.id_personas_convivio ?? 0)
            setConsumoPersona(resultConsumoPersona?.data ?? [])
        }
        setCloseScreenLoading()
    }

    useEffect(() => { handleChargeQrScanner() }, [valueQr])

    useEffect(() => { handleValueScannerQr() }, [valueScannedQr])

    return (
        <>
            <PageLayout titleAppBar="Gestion convivio">
                <ScrollViewContainer>
                    <View className="w-full mt-10 mb-10">
                        <View className="flex flex-col gap-3">
                            <CardTitle 
                                style={{ width: '100%' }} 
                                icon="qrcode-scan" 
                                title="Scannear Invitacion" 
                                rightElement={<IconButton icon={'chevron-right'}/>}
                                onPress={() => NavigationService.navigate('ScannerQr')}
                            />
                            <CardTitle 
                                style={{ width: '100%' }} 
                                icon="account-check"
                                title="Generar Invitacion" 
                                rightElement={<IconButton icon={'chevron-right'}/>}
                                onPress={() => NavigationService.navigate('CrearQrConvivio')}
                            />
                            <CardTitle 
                                style={{ width: '100%' }} 
                                icon="package-variant"
                                title="Crear producto"
                                rightElement={<IconButton icon={'chevron-right'}/>}
                                onPress={() => NavigationService.navigate('CrearProductoConvivio')}
                            />
                        </View>

                        <View className="flex flex-col mt-3">

                            <CardContent>
                                <View className="w-full">
                                    {
                                        personaQr ?
                                        <>
                                            <ListItemComponent 
                                                title={'Codigo'}
                                                description={personaQr.codigo}
                                            />
                                            <ListItemComponent 
                                                title={'Nombre'}
                                                description={personaQr.nombre_persona_convivio}
                                            />
                                            <ListItemComponent 
                                                title={'Tipo'}
                                                description={personaQr.TipoPersonasConvivioModel.name_tipo_persona_convivio}
                                            />
                                        </>
                                        :
                                        <Text style={{ textAlign: 'center' }}>No hay Informacion</Text>
                                    }
                                </View>
                            </CardContent>

                            <DataTableInfo
                                pagination={false}
                                data={consumoPersona}
                                // groupField="name_category_productos_convivio"
                                configTable={[
                                    {
                                        data: null,
                                        name: 'Nombre',
                                        render: (data:ResponseConsumoPersonaType) => (
                                            <View className="w-full flex-row gap-1 items-center justify-between">
                                                <Text 
                                                    style={{ flexShrink: 1, flexGrow: 1, marginRight: 8 }} 
                                                    numberOfLines={3}
                                                >
                                                    { data?.name_producto_convivio ?? ' -- ' }
                                                </Text>
                                                <View className="flex flex-row gap-1 items-center justify-center">
                                                    <Text className="mr-2">{ data?.total_consumido ?? 0 }</Text>
                                                    <IconButtomForm 
                                                        icon="plus" 
                                                        style={{ margin: 0 }}
                                                        onPress={() => handleOnpressAddConsumo(data, 'POST')}
                                                    />
                                                    <IconButtomForm 
                                                        icon="minus" 
                                                        disabled={Number(data.total_consumido ?? "0") <= 0}
                                                        containerColor={theme.colors.error} 
                                                        style={{ margin: 0 }}
                                                        onPress={() => handleOnpressAddConsumo(data, 'DELETE')}
                                                    />
                                                </View>
                                                
                                            </View>
                                        )
                                    },
                                ]}
                            />

                        </View>

                    </View>
                </ScrollViewContainer>
            </PageLayout>
        </>
    )
}