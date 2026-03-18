import { yupResolver } from "@hookform/resolvers/yup";
import ScrollViewContainer from "components/container/ScrollViewContainer";
import ButtonForm from "components/form/ButtonForm";
import DropdownForm from "components/form/DropdownForm";
import InputFormHook from "components/form/InputFormHook";
import PageLayout from "components/Layouts/PageLayout";
import { AJAX, URLPIOAPP } from "helpers/http/ajax";
import { NavigationService } from "helpers/navigator/navigationScreens";
import alertsState from "helpers/states/alertsState";
import globalState from "helpers/states/globalState";
import schemaNwProductoConvivio, { schemaNwProductoConvivioType } from "helpers/validatesForm/schemaNwProductoConvivio";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import CatergorysProductConvivioType from "types/convivio/CatergorysProductConvivioType";
import { generateJsonError, ResponseService } from "types/RequestType";

export default function CrearProductoConvivio() {

    const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false)

    const [categorys, setCategorys] = useState<CatergorysProductConvivioType[]>([])

    const { openVisibleSnackBar } = alertsState()

    const { setOpenScreenLoading, setCloseScreenLoading } = globalState()

    const { control, handleSubmit, reset, resetField, formState: { errors, isValid } } = useForm({
        resolver: yupResolver(schemaNwProductoConvivio),
        mode: 'all'
    })

    const getAllCategoryProductConvivio = async () : Promise<ResponseService<CatergorysProductConvivioType[]>> => {
        try {
            const result = await AJAX(`${URLPIOAPP}/category/product/convivio/all`)
            return result
        } catch (error) {
            openVisibleSnackBar(`${error}`, 'error')
            return generateJsonError(`${error}`, 'array')
        }
    }

    const postCreateProductoConvivio = async (data:schemaNwProductoConvivioType) : Promise<ResponseService<any>> => {
        try {
            const result:ResponseService<any> = await AJAX(`${URLPIOAPP}/producto/convivio/create`, 'POST', data)
            openVisibleSnackBar(result?.message ?? 'Proceso realizado correctamente', 'success')
            return result
        } catch (error) {
            openVisibleSnackBar(`${error}`, 'error')
            return generateJsonError(`${error}`, 'object')
        }
    }

    const handleSubmitFormNwProductoConvivio = async(data:schemaNwProductoConvivioType) => {
        setIsLoadingForm(true)
        const resultCreateProducto = await postCreateProductoConvivio(data)
        resultCreateProducto.status && NavigationService.reset('NominaConvivio')
        setIsLoadingForm(false)
    } 

    const init = async () => {
        setOpenScreenLoading()
        const categorysResponse = await getAllCategoryProductConvivio()
        setCategorys(categorysResponse.data as CatergorysProductConvivioType[])
        setCloseScreenLoading()
    }

    useEffect(() => { init() }, [])

    return (
        <>
            <PageLayout titleAppBar="Crear Producto" goBack={true}>
                <ScrollViewContainer>
                    <View className="w-full mt-6"> 
                        <View className="w-full flex flex-col gap-3.5">
                            <InputFormHook
                                control={control}
                                name="name_producto_convivio"
                                label="Producto"
                                placeholder="Ingrese un nombre"
                                errors={errors}
                                disabled={isLoadingForm}
                            />
                            <DropdownForm
                                control={control}
                                name="id_category_productos_convivio"
                                label="Categoria"
                                errors={errors}
                                disable={isLoadingForm}
                                data={
                                    categorys.map(
                                        el => ({ 
                                            value: el.id_category_productos_convivio,
                                            label: el.name_category_productos_convivio 
                                        })
                                    )
                                }
                            />
                            <InputFormHook
                                control={control}
                                name="descripcion_producto_convivio"
                                label="Descripcion"
                                placeholder="Ingresa un a descripcion"
                                errors={errors}
                                disabled={isLoadingForm}
                            />
                            <ButtonForm
                                icon="content-save"
                                label="Guardar"
                                loading={isLoadingForm}
                                disabled={!isValid || isLoadingForm}
                                onPress={handleSubmit(handleSubmitFormNwProductoConvivio)}
                            />
                        </View>
                    </View>
                </ScrollViewContainer>
            </PageLayout>
        </>
    )
}