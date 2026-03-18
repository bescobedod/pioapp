import ScrollViewContainer from "components/container/ScrollViewContainer";
import ModalizeComponent from "components/Modals/ModalizeComponent";
import { View } from "react-native";
import { Text } from "react-native-paper";

type ModalizeUserProps = {
    modalizeRefUser:any
}

export default function ModalizeUser({
    modalizeRefUser
} : ModalizeUserProps) {

    
    return (
        <>
            <ModalizeComponent
                modalizeRef={modalizeRefUser}
                heightModalizeSreen={0.50}
                title={"Editar foto"}
            >
                <ScrollViewContainer paddingHorizontal={0}>
                    <View>
                        { 
                            Array(50).fill(null).map((el, index) => (
                                <Text key={index}>Hola mundo</Text>
                            ))
                        }
                    </View>
                </ScrollViewContainer>
            </ModalizeComponent>
        </>
    )
}