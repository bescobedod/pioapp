import ButtonForm from "components/form/ButtonForm";
import ModalizeComponent from "components/Modals/ModalizeComponent";
import { authenticateBiometric } from "helpers/Biometric/BiometricHelper";
import { onCloseModalize } from "helpers/Modalize/ModalizeHelper";
import alertsState from "helpers/states/alertsState";
import globalState from "helpers/states/globalState";
import { getValueStorage, setValueStorage } from "helpers/store/storeApp";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useTheme } from "react-native-paper";
import { UserSessionType } from "types/auth/UserSessionType";
import BiometricStorageType from "types/Biometric/BiometricStorageType";
import { AppTheme } from "types/ThemeTypes";

type ModalizeBiometricProps = {
    modalizeRefBiometric:any
}

export default function ModalizeBiometric({
    modalizeRefBiometric
} : ModalizeBiometricProps) {

    const theme:AppTheme = useTheme() as AppTheme
    const [storageBiometric, setStorageBiometric] = useState<BiometricStorageType|null>(null)
    const [user, setUser] = useState<UserSessionType|null>(null)
    const { setOpenScreenLoading, setCloseScreenLoading } = globalState()
    const { openVisibleSnackBar } = alertsState()

    const handleOpenModalizeBiometric = () => {
        const getUser = getValueStorage('user') as UserSessionType
        const getBiometrics = getValueStorage('biometrico') as BiometricStorageType
        setStorageBiometric(getBiometrics ?? null)
        setUser(getUser ?? null)
    } 

    const onPressButtonBiometrics = async() => {
        setOpenScreenLoading()
        const payloadBiometrico:BiometricStorageType = { id_users: user?.id_users ?? '' }
        if(!storageBiometric) {
            const resultLoginBiometric = await authenticateBiometric()
            if(resultLoginBiometric.success){
                setValueStorage('biometrico', payloadBiometrico)
                openVisibleSnackBar(`Biometrico activado correctamente.`, 'success')
                onCloseModalize(modalizeRefBiometric)
            }
        }else {
            setValueStorage('biometrico', null)
            openVisibleSnackBar(`Biometrico desactivado correctamente.`, 'success')
            onCloseModalize(modalizeRefBiometric)
        }
        handleOpenModalizeBiometric()
        setCloseScreenLoading()
    }

    return (
        <>
            <ModalizeComponent
                onOpen={handleOpenModalizeBiometric}
                modalizeRef={modalizeRefBiometric}
                title="Configurar biometrico"
                heightModalizeSreen={0.25}
            >
                <ButtonForm
                    icon={ storageBiometric ? "toggle-switch-off" :  "toggle-switch"}
                    label={ storageBiometric ? 'Desactivar' : 'Activar'}
                    buttonColor={ storageBiometric ? theme.colors.error : theme.colors.success }
                    onPress={onPressButtonBiometrics}
                />
            </ModalizeComponent>
        </>
    )
}