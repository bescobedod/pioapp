import ModalizeComponent from "components/Modals/ModalizeComponent";
import { TableDataArticulosDevolucion } from "../DevolucionCreacionPage";
import FormAdaptiveKeyBoard from "components/container/FormAdaptiveKeyBoard";
import { View } from "react-native";
import InputFormHook from "components/form/InputFormHook";
import DropdownForm from "components/form/DropdownForm";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ButtonForm from "components/form/ButtonForm";
import ListItemComponent from "components/List/ListItemComponent";
import { useTheme } from "react-native-paper";
import { AppTheme } from "types/ThemeTypes";
import { useEffect } from "react";
import schemaEditCountDevolucion, { schemaEditCountDevolucionType } from "helpers/validatesForm/schemaEditCountDevolucion";
import { onCloseModalize } from "helpers/Modalize/ModalizeHelper";

type ModalizeDevolucionArticuloProps = {
    modalizeRefDevolucionArticulo:any;
    selectArticuloDevolucion:TableDataArticulosDevolucion|null;
    motivosDropdown: { label: string, value: number }[];
    editCantidadDevolverState: (cantidadDevolver:number, id_devolucion_motivo:number, motivoName:string) => void;
}

export default function ModalizeDevolucionArticulo({
    modalizeRefDevolucionArticulo,
    selectArticuloDevolucion,
    motivosDropdown,
    editCantidadDevolverState
}:ModalizeDevolucionArticuloProps) {

    const theme = useTheme() as AppTheme
    const { control, handleSubmit, reset, resetField, formState: { errors, isValid }, watch } = useForm({
        resolver: yupResolver(schemaEditCountDevolucion(Number(selectArticuloDevolucion?.cantidadReal ?? 0))),
        mode: 'all'
        // shouldUnregister: true
    })

    const onOpenModalizeDevolucionArticulo = () => {
        if(!selectArticuloDevolucion) return
        resetField('cantidad_devolucion', { defaultValue: Number(selectArticuloDevolucion?.cantidadDevolver ?? 0) })
        resetField('id_devolucion_motivo', { defaultValue: selectArticuloDevolucion?.id_devolucion_motivo ?? undefined })
    }

    const onSubmitForm = (data:schemaEditCountDevolucionType) => {
        const itemMotivo = motivosDropdown.find(m => m.value === data.id_devolucion_motivo);
        const motivoName = itemMotivo ? itemMotivo.label : '';
        editCantidadDevolverState(Number(data.cantidad_devolucion), Number(data.id_devolucion_motivo), motivoName)
        onCloseModalize(modalizeRefDevolucionArticulo)
    }

    useEffect(() => { onOpenModalizeDevolucionArticulo() }, [selectArticuloDevolucion])

    return (
        <>
            <ModalizeComponent
                modalizeRef={modalizeRefDevolucionArticulo}
                // onOpen={onOpenModalizeDevolucionArticulo}
                title="Devolucion"
                footerComponent={(
                    <ButtonForm 
                        icon="pencil" 
                        label="Editar"
                        disabled={(!isValid)}
                        onPress={handleSubmit(onSubmitForm)}
                    />
                )}
            >
                <FormAdaptiveKeyBoard>
                    <View className="w-full flex-col gap-3.5">
                        <ListItemComponent
                            titleStyle={{ color: theme.colors.primary }}
                            title={`${selectArticuloDevolucion?.ItemCode ?? ' -- '} - ${selectArticuloDevolucion?.nombreProducto ?? ' -- '}`}
                            description={`Cantidad de la recepcion: ${selectArticuloDevolucion?.cantidadReal ?? ' -- '}`}
                        />
                        <InputFormHook
                            control={control}
                            name="cantidad_devolucion"
                            label="Cantidad devolucion"
                            errors={errors}
                            inputType="number-pad"
                            placeholder="Ingrese una cantidad"
                        />
                        <DropdownForm
                            label="Motivo de devolución"
                            data={motivosDropdown}
                            control={control}
                            name="id_devolucion_motivo"
                            errors={errors}
                        />
                    </View>
                </FormAdaptiveKeyBoard>
            </ModalizeComponent>
        </>
    )
}