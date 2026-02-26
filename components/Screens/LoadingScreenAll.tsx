import globalState from "helpers/states/globalState";
import { ActivityIndicator, Modal, Portal, useTheme } from "react-native-paper";
import { AppTheme } from "types/ThemeTypes";

export default function LoadingScreenAll() {

    const theme = useTheme() as AppTheme

    const { screenLoadingAll } = globalState()

    return (
        <Portal>
            <Modal visible={screenLoadingAll} style={{ backgroundColor: theme.colors.background }}>
                <ActivityIndicator animating={true} size={'large'} color={theme.colors.primary} />
            </Modal>
        </Portal>
    )
}