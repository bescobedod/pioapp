import { StyleProp, View, ViewStyle } from "react-native"
import { Text, useTheme, IconButton } from "react-native-paper"
import { AppTheme } from "types/ThemeTypes";

type InfoAlertType = {
    label?: string;
    className?: string;
    styleContent?: StyleProp<ViewStyle>
}

export default function InfoAlert({
    label = '',
    styleContent
} : InfoAlertType)
{

    const theme = useTheme() as AppTheme

    return (
        <View style={[styleContent]} className="flex-row gap-1 items-center">
            <IconButton
                icon="alert-circle"
                iconColor={theme.colors.onErrorContainer}
                size={16}
                style={{ margin: 0 }}
            />
            <Text variant="bodySmall" style={{ color: theme.colors.onErrorContainer }}>
                { label }
            </Text>
        </View>
    )
}