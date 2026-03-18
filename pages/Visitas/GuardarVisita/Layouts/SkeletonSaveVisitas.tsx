import globalState from "helpers/states/globalState";
import { Skeleton } from "moti/skeleton";
import { StyleProp, View, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";
import { AppTheme } from "types/ThemeTypes";

type SkeletonSaveVisitasProps = {
    styleContent?: StyleProp<ViewStyle>
}

export default function SkeletonSaveVisitas({
    styleContent
} : SkeletonSaveVisitasProps) {

    const theme:AppTheme = useTheme() as AppTheme

    const { dark } = globalState()

    const colorMode:"dark" | "light" = dark ? 'dark' : 'light';

    return (
        <>
            <View className="gap-3.5 mt-5 mb-5" style={[styleContent, { backgroundColor: theme.colors.background, paddingBottom: 20 }]}>
                <Skeleton colorMode={colorMode} height={55} width={'100%'}/>
                <Skeleton colorMode={colorMode} height={55} width={'100%'}/>
                <Skeleton colorMode={colorMode} height={200} width={'100%'}/>
                <Skeleton colorMode={colorMode} height={55} width={'100%'}/>
                <View className="mt-4"><Skeleton colorMode={colorMode} height={55} width={'100%'}/></View>
            </View>
        </>
    )
}