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
import { Text, useTheme } from "react-native-paper";
import { AppTheme } from "types/ThemeTypes";
import { useEffect } from "react";
import schemaEditCountDevolucion from "helpers/validatesForm/schemaEditCountDevolucion";
import { onCloseModalize } from "helpers/Modalize/ModalizeHelper";


type ModalizeDevolucionArticuloProps = {
    modalizeRefDevolucionArticulo:any;
    selectArticuloDevolucion:TableDataArticulosDevolucion|null;
    motivosDropdown: { label: string, value: number }[];
    editCantidadDevolverState: (
        id_devolucion_motivo:number, 
        motivoName:string, 
        cantidadDevolver:number,
        unidadDevolucion:string | null, 
        piezas: { id_pieza: number, cantidad: number }[] | null,
        nota_reclamo:string|null
    ) => void;
}

export default function ModalizeDevolucionArticulo({
    modalizeRefDevolucionArticulo,
    selectArticuloDevolucion,
    motivosDropdown,
    editCantidadDevolverState
}:ModalizeDevolucionArticuloProps) {

    const theme = useTheme() as AppTheme
    const { control, handleSubmit, reset, formState: { errors, isValid }, watch } = useForm({
        resolver: yupResolver(schemaEditCountDevolucion()),
        mode: 'all'
    })

    const tipoPolloDropdown = [
        { label: 'Estándar', value: 'Estándar' },
        { label: 'Pequeño', value: 'Pequeño' },
        { label: 'Extrapequeño', value: 'Extrapequeño' },
        { label: 'Bajo Peso', value: 'Bajo Peso' },
        { label: 'Extra Bajo Peso', value: 'Extra Bajo Peso' }
    ];

    const selectedMotivo = Number(watch('id_devolucion_motivo'));

    // Motivos que deben mostrar LIBRAS, ONZAS, POLLOS
    const idsConPollos = [13, 14, 15, 16, 17, 18, 19, 20, 27];
    
    const unidadesDropdown = idsConPollos.includes(selectedMotivo) 
        ? [
            { label: 'LIBRAS', value: 'LIBRAS' },
            { label: 'ONZAS', value: 'ONZAS' },
            { label: 'POLLOS', value: 'POLLOS' },
            { label: 'UNIDADES', value: 'UNIDADES' }
          ]
        : [
            { label: 'LIBRAS', value: 'LIBRAS' },
            { label: 'ONZAS', value: 'ONZAS' }
          ];

    // GRUPOS LÓGICOS DE UI HARDCODEADOS
    // Grupo 1: Cantidad + Select Unidad
    const idsGrupo1 = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 27];
    const isG1 = idsGrupo1.includes(selectedMotivo);

    // Grupo 2: Devolver Piezas Desglosadas -> 4 counters
    const idsGrupo2 = [24, 25];
    const isG2 = idsGrupo2.includes(selectedMotivo);

    // Grupo 3: Devolver Cantidad general de Piezas -> Input Cantidad
    const idsGrupo3 = [23];
    const isG3 = idsGrupo3.includes(selectedMotivo);

    // Grupo 4: Devolver Pollos -> Input Cantidad Pollos
    const idsGrupo4 = [26];
    const isG4 = idsGrupo4.includes(selectedMotivo);

    // Grupo 5: Devolver Alitas -> Input Cantidad (multiplo 5) Alitas
    const idsGrupo5 = [28];
    const isG5 = idsGrupo5.includes(selectedMotivo);

    const onOpenModalizeDevolucionArticulo = () => {
        if(!selectArticuloDevolucion) return
        
        let p1 = '', p2 = '', p3 = '', p4 = '';
        if (selectArticuloDevolucion.piezas) {
            selectArticuloDevolucion.piezas.forEach(p => {
                if(p.id_pieza === 1) p1 = p.cantidad.toString();
                if(p.id_pieza === 2) p2 = p.cantidad.toString();
                if(p.id_pieza === 3) p3 = p.cantidad.toString();
                if(p.id_pieza === 4) p4 = p.cantidad.toString();
            })
        }

        // Se usa reset() en lugar de n-resetField() para limpiar por completo cualquier estado arrastrado de un articulo anterior
        reset({
            id_devolucion_motivo: selectArticuloDevolucion?.id_devolucion_motivo,
            cantidad_devolucion: selectArticuloDevolucion?.cantidadDevolver ? Number(selectArticuloDevolucion.cantidadDevolver) : undefined,
            unidad_devolucion: selectArticuloDevolucion?.unidadMedidaDevolucion ?? undefined,
            pieza_1: p1 ? Number(p1) : undefined,
            pieza_2: p2 ? Number(p2) : undefined,
            pieza_3: p3 ? Number(p3) : undefined,
            pieza_4: p4 ? Number(p4) : undefined,
            tipo_pollo_reclamo: undefined,
            peso_bascula_reclamo: undefined
        });
    }

    const onSubmitForm = (data:any) => {
        const itemMotivo = motivosDropdown.find(m => m.value === data.id_devolucion_motivo);
        const motivoName = itemMotivo ? itemMotivo.label : '';

        let act_cantidad_devolucion = 0;
        let act_unidad_devolucion = null;
        let act_piezas: any[] = [];
        let nota_reclamo = null;

        const populatePiezas = () => {
            const p = [];
            if(data.pieza_1) p.push({ id_pieza: 1, cantidad: Number(data.pieza_1) });
            if(data.pieza_2) p.push({ id_pieza: 2, cantidad: Number(data.pieza_2) });
            if(data.pieza_3) p.push({ id_pieza: 3, cantidad: Number(data.pieza_3) });
            if(data.pieza_4) p.push({ id_pieza: 4, cantidad: Number(data.pieza_4) });
            return p;
        }

        if (isG1) {
            act_cantidad_devolucion = Number(data.cantidad_devolucion || 0);
            act_unidad_devolucion = data.unidad_devolucion;
        } 
        else if (isG2) {
            act_piezas = populatePiezas();
            act_cantidad_devolucion = act_piezas.reduce((acc, curr) => acc + curr.cantidad, 0); // Total de piezas
            act_unidad_devolucion = 'PIEZAS';
        }
        else if (isG3) {
            act_cantidad_devolucion = Number(data.cantidad_devolucion || 0);
            act_unidad_devolucion = 'PIEZAS'; 
        }
        else if (isG4) {
            act_cantidad_devolucion = Number(data.cantidad_devolucion || 0);
            act_unidad_devolucion = 'POLLOS';
        }
        else if (isG5) {
            act_cantidad_devolucion = Number(data.cantidad_devolucion || 0);
            act_unidad_devolucion = 'ALITAS';
        }

        editCantidadDevolverState(
            Number(data.id_devolucion_motivo), 
            motivoName, 
            act_cantidad_devolucion, 
            act_unidad_devolucion, 
            act_piezas.length > 0 ? act_piezas : null, 
            nota_reclamo
        );
        onCloseModalize(modalizeRefDevolucionArticulo)
    }

    useEffect(() => { onOpenModalizeDevolucionArticulo() }, [selectArticuloDevolucion])

    return (
        <>
            <ModalizeComponent
                modalizeRef={modalizeRefDevolucionArticulo}
                title="Acción por Motivo"
                footerComponent={(
                    <ButtonForm 
                        icon="check" 
                        label="Confirmar"
                        onPress={handleSubmit(onSubmitForm)}
                    />
                )}
            >
                <FormAdaptiveKeyBoard>
                    <View className="w-full flex-col gap-3.5 mb-10">
                        <ListItemComponent
                            titleStyle={{ color: theme.colors.primary }}
                            title={`${selectArticuloDevolucion?.ItemCode ?? ' -- '} - ${selectArticuloDevolucion?.nombreProducto ?? ' -- '}`}
                            description={`Cantidad de la recepcion: ${selectArticuloDevolucion?.cantidadReal ?? ' -- '} ${selectArticuloDevolucion?.unidadMedida ?? ''}`}
                        />
                        <DropdownForm
                            label="Selecciona un Motivo"
                            data={motivosDropdown}
                            control={control}
                            name="id_devolucion_motivo"
                            errors={errors}
                        />

                        {!!selectedMotivo && (
                            <View className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                {isG1 && (
                                    <>
                                        <Text variant="titleMedium" style={{color: theme.colors.error, marginBottom: 10}}>DEVOLVER (Restar producto)</Text>
                                        <InputFormHook control={control} name="cantidad_devolucion" label="Cantidad a Devolver" errors={errors} inputType="numeric" placeholder="Ej. 10.5" />
                                        <DropdownForm 
                                          label="Unidad" 
                                          data={unidadesDropdown} 
                                          control={control} 
                                          name="unidad_devolucion" 
                                          errors={errors} 
                                        />
                                    </>
                                )}

                                {isG2 && (
                                    <>
                                        <Text variant="titleMedium" style={{color: theme.colors.error, marginBottom: 10}}>DEVOLVER PIEZAS</Text>
                                        <Text variant="bodySmall" className="mb-2">Ingresa cuántas piezas devolverás:</Text>
                                        <View className="flex-row justify-between flex-wrap">
                                            <View className="w-1/2 p-1"><InputFormHook control={control} name="pieza_1" label="Pierna" inputType="number-pad" /></View>
                                            <View className="w-1/2 p-1"><InputFormHook control={control} name="pieza_2" label="Ala" inputType="number-pad" /></View>
                                            <View className="w-1/2 p-1"><InputFormHook control={control} name="pieza_3" label="Pechuga" inputType="number-pad" /></View>
                                            <View className="w-1/2 p-1"><InputFormHook control={control} name="pieza_4" label="Cuadril" inputType="number-pad" /></View>
                                        </View>
                                    </>
                                )}

                                {isG3 && (
                                    <>
                                        <Text variant="titleMedium" style={{color: theme.colors.error, marginBottom: 10}}>DEVOLVER PIEZAS FALTANTES</Text>
                                        <Text variant="bodySmall" className="mb-2">Ingresa la cantidad de piezas a devolver:</Text>
                                        <InputFormHook control={control} name="cantidad_devolucion" label="Cantidad de Piezas" errors={errors} inputType="number-pad" placeholder="Ej. 5" />
                                    </>
                                )}

                                {isG4 && (
                                    <>
                                        <Text variant="titleMedium" style={{color: theme.colors.error, marginBottom: 10}}>DEVOLVER POLLOS</Text>
                                        <InputFormHook control={control} name="cantidad_devolucion" label="Pollos a Devolver" errors={errors} inputType="number-pad" placeholder="Ej. 5" />
                                    </>
                                )}

                                {isG5 && (
                                    <>
                                        <Text variant="titleMedium" style={{color: theme.colors.error, marginBottom: 10}}>DEVOLVER ALITAS</Text>
                                        <Text variant="bodySmall" style={{color: theme.colors.error}} className="mb-2">* Las bolsas traen 60. Se devuelve en múltiplos de 5.</Text>
                                        <InputFormHook control={control} name="cantidad_devolucion" label="Alitas a Devolver" errors={errors} inputType="number-pad" placeholder="Ej. 10" />
                                    </>
                                )}
                            </View>
                        )}

                    </View>
                </FormAdaptiveKeyBoard>
            </ModalizeComponent>
        </>
    )
}