import { yupResolver } from "@hookform/resolvers/yup";
import FormAdaptiveKeyBoard from "components/container/FormAdaptiveKeyBoard";
import ButtonForm from "components/form/ButtonForm";
import InputFormHook from "components/form/InputFormHook";
import ModalizeComponent from "components/Modals/ModalizeComponent";
import { AJAX, URLPIOAPP } from "helpers/http/ajax";
import alertsState from "helpers/states/alertsState";
import globalState from "helpers/states/globalState";
import schemaCreateInvitado, { schemaCreateInvitadoType } from "helpers/validatesForm/schemaCreateInvitado";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { generateJsonError, ResponseService } from "types/RequestType";

type ModalizeCreateInvitadoType = {
    modalizeRef?: any;
    onCloseModalizeCreateInvitado: () => void;
    renderInvitados: () => Promise<any>;
}

export default function ModalizeCreateInvitado ({
    modalizeRef,
    onCloseModalizeCreateInvitado,
    renderInvitados
} : ModalizeCreateInvitadoType) {

    const { openVisibleSnackBar } = alertsState()

    const { setOpenScreenLoading, setCloseScreenLoading } = globalState()

    const [isLodingFormCreate, setIsLodingFormCreate] = useState<boolean>(false)

    const { control, handleSubmit, reset, resetField, formState: { errors, isValid } } = useForm({
        resolver: yupResolver(schemaCreateInvitado),
        mode: 'all'
    })

    const postCreateNwInvitado = async(data:schemaCreateInvitadoType):Promise<ResponseService<any>> => {
        try {
            const result:ResponseService<any> = await AJAX(`${URLPIOAPP}/personas/convivio/create/invitado`, 'POST', data)
            openVisibleSnackBar(result?.message ?? ' Operacion completada correctamente ', 'success')
            return result
        } catch (error) {
            openVisibleSnackBar(`${error}`, 'error')
            return generateJsonError(`${error}`, 'object')
        }
    }

    const handleSubmitCreateInvitado = async(data:schemaCreateInvitadoType) => {
        setIsLodingFormCreate(true)
        const resultCreateInvitado = await postCreateNwInvitado(data)
        if(resultCreateInvitado.status) {
            setOpenScreenLoading()
            reset()
            onCloseModalizeCreateInvitado()
            await renderInvitados()
            setCloseScreenLoading()
        }
        setIsLodingFormCreate(false)
    }

    return (
        <>
            <ModalizeComponent 
                title="Crear Invitado"
                modalizeRef={modalizeRef}
                footerComponent={
                    <ButtonForm
                        label="Crear"
                        icon="content-save"
                        disabled={!isValid || isLodingFormCreate}
                        loading={isLodingFormCreate}
                        onPress={handleSubmit(handleSubmitCreateInvitado)}
                    />
                }
            >
                    <FormAdaptiveKeyBoard>
                        <View className="w-full flex flex-col gap-3.5">
                            <InputFormHook
                                control={control}
                                errors={errors}
                                name="nombre_persona_convivio"
                                label="Nombre invitado"
                                placeholder="Ingrese el nombre del invitado"
                                disabled={isLodingFormCreate}
                            />
                            <InputFormHook
                                control={control}
                                errors={errors}
                                name="empresa"
                                label="Empresa (opcional)"
                                placeholder="Ingrese el nombre la empresa"
                                disabled={isLodingFormCreate}
                            />
                        </View>
                    </FormAdaptiveKeyBoard>
            </ModalizeComponent>
        </>
    )
}