import { RouteProp, useRoute } from "@react-navigation/native"
import ButtonForm from "components/form/ButtonForm"
import TextInfo from "components/typografy/TextInfo"
import Title from "components/typografy/Title"
import { NavigationService } from "helpers/navigator/navigationScreens"
import { RouterName } from "helpers/navigator/routers"
import { validateConnectionInternetActive } from "helpers/network/internetHelper"
import { useState } from "react"
import { GestureResponderEvent, View } from "react-native"
import { Icon, Text } from "react-native-paper"

type RouteParamasFailConnectInternetType = {
    route:RouterName
}

export default function FailConnectInternet () {

    const route = useRoute<RouteProp<{ params:RouteParamasFailConnectInternetType }, 'params'>>();
    const routeReturnNavigate = route?.params?.route ?? null
    const [loadingTryAgain, setLoadingTryAgain] = useState<boolean>(false)

    const handlePressButtonTryAgain = async (e:GestureResponderEvent) : Promise<void> => {
        setLoadingTryAgain(true)
        const isAuthRoute = routeReturnNavigate === 'Login'
        const connection:boolean = await validateConnectionInternetActive()
        // connection && NavigationService.goBack()
        connection && NavigationService.reset(isAuthRoute ? 'Login' : 'Home')
        setLoadingTryAgain(false)
    }

    return (
        <>
            <View 
                className="flex-1 w-full h-full flex flex-col items-center justify-center gap-3" 
                style={{ padding: 35 }}
            >
                <Icon source={'wifi-strength-off-outline'} size={90}/>

                <Title>Oooops!</Title>

                <TextInfo style={{ textAlign: 'center' }}>
                    Parece que hay algún problema con tu conexión a internet. Por favor, conéctate a internet.
                </TextInfo>

                <ButtonForm 
                    icon="reload" 
                    label="Intentar otra vez"
                    onPress={handlePressButtonTryAgain}
                    loading={loadingTryAgain}
                    disabled={loadingTryAgain}
                />
            </View>
        </>
    )
}