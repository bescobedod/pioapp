import globalState from "helpers/states/globalState";
import { Skeleton } from "moti/skeleton";
import { View } from "react-native";

export default function SkeletonPreviousNotification () {

    const { dark } = globalState()
    
    const colorMode:"dark" | "light" = dark ? 'dark' : 'light';

    return (
        <>
            <View className="w-full flex-col">
                <View className="w-full gap-6" style={{ marginTop: 20 }}>
                    {
                        Array(4).fill(null).map((el, index) => (
                            <View className="w-full flex-col gap-1" key={index}>
                                <View style={{ marginLeft: 15 }}><Skeleton colorMode={colorMode} height={20} width={150}/></View>
                                <Skeleton colorMode={colorMode} height={75} width={'100%'}/> 
                            </View>
                        ))
                    }
                </View>
            </View>
        </>
    )
}