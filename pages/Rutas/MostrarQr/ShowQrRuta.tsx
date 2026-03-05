import PageLayout from "components/Layouts/PageLayout";
import QrImgCode from "components/Qr/QrImgCode";
import TextInfo from "components/typografy/TextInfo";
import Title from "components/typografy/Title";
import { View } from "react-native";
import { useTheme } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import ParamansQrRutasType from "types/QrRutas/ParamansQrRutasType";

export default function ShowQrRuta() {

    const theme = useTheme()

    const router = useRoute()

    const paramsRouter:ParamansQrRutasType = router?.params as ParamansQrRutasType

    return (
        <>
            <PageLayout titleAppBar="Qr Ruta" goBack={true}>

                <View className="flex-1 justify-center items-center gap-10" style={{ paddingHorizontal: 35 }}>

                    <View 
                        // className="bg-white p-2"
                    >
                        <QrImgCode 
                            value={`${JSON.stringify({ 
                                id_pedido: paramsRouter.rutas?.id_pedido, 
                                serie: paramsRouter.rutas?.serie,
                                nombre_tienda: paramsRouter.rutas?.tienda_nombre 
                            })}`} 
                            size={230}
                        />
                    </View>

                    <View className="flex flex-col items-center justify-center w-full">
                        <Title style={{ textAlign: 'center' }}>{ paramsRouter.rutas?.tienda_nombre || ' -- ' }</Title>
                        <TextInfo style={{ padding: 10, textAlign: "center" }}>Muestra este QR al colaborador de Tienda</TextInfo>
                    </View>

                </View>

            </PageLayout>
        </>
    )
}